import { randomBytes } from 'node:crypto';
import type { PaginatedResponse, UserDTO } from '@accountable/types';
import type { CreateUserInput } from '@accountable/schemas';
import {
  BusinessRuleError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../../domain/errors/index.js';
import type {
  IAuditRepository,
  IRoleRepository,
  IUserRepository,
} from '../../../domain/repositories/index.js';
import type { IEmailService, IHasher, IUnitOfWork } from '../../contracts/index.js';
import type { AuthSessionService } from '../../services/auth-session.service.js';
import type { EmailTokenService } from '../../services/email-token.service.js';
import { ADMIN_GUARD_PERMISSION, toUserDTO } from './user.mapper.js';

export const USER_INVITATION_TTL_HOURS = 72;

interface ActorContext {
  actorId: string;
  actorEmail?: string;
  ipAddress?: string;
  userAgent?: string;
}

// ------------------------------------------------------------
export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: { page?: number; perPage?: number; search?: string }): Promise<PaginatedResponse<UserDTO>> {
    const page = Math.max(1, params.page ?? 1);
    const perPage = Math.min(100, Math.max(1, params.perPage ?? 20));
    const { items, total } = await this.userRepository.list({ page, perPage, search: params.search });
    return { data: items.map(toUserDTO), total, page, perPage, totalPages: Math.ceil(total / perPage) };
  }
}

// ------------------------------------------------------------
async function assertRolesExist(roleRepository: IRoleRepository, roleIds: string[]): Promise<void> {
  const unique = [...new Set(roleIds)];
  const found = await roleRepository.findByIds(unique);
  if (found.length !== unique.length) {
    throw new ValidationError('Um ou mais perfis selecionados não existem.');
  }
}

/**
 * Cria um utilizador interno. Sem senha → envia convite por email (link + código)
 * para o próprio definir a senha; o administrador nunca a conhece.
 */
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly hasher: IHasher,
    private readonly emailTokens: EmailTokenService,
    private readonly emailService: IEmailService,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly adminAppUrl: string,
  ) {}

  async execute(input: CreateUserInput, context: ActorContext): Promise<UserDTO> {
    if (await this.userRepository.findByEmail(input.email)) {
      throw new ConflictError('Já existe um utilizador registado com este endereço de email.');
    }
    await assertRolesExist(this.roleRepository, input.roleIds);

    const invite = !input.password;
    // Convidados recebem uma senha aleatória inutilizável até definirem a sua.
    const passwordHash = await this.hasher.hash(input.password ?? randomBytes(32).toString('hex'));

    const { user, issued } = await this.unitOfWork.run(async () => {
      const created = await this.userRepository.create({
        email: input.email,
        name: input.name,
        passwordHash,
        roleIds: input.roleIds,
      });

      const token = invite
        ? await this.emailTokens.issue('USER_PASSWORD_RESET', created.id, USER_INVITATION_TTL_HOURS * 3600 * 1000)
        : null;

      const withRoles = await this.userRepository.findByIdWithRoles(created.id);
      await this.auditRepository.log({
        userId: context.actorId,
        action: invite ? 'USER_INVITED' : 'USER_CREATED',
        entity: 'User',
        entityId: created.id,
        newValues: { email: created.email, name: created.name, roles: withRoles?.roles.map((r) => r.role.name) ?? [] },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return { user: withRoles!, issued: token };
    });

    if (issued) {
      await this.emailService.sendUserInvitation({
        to: user.email,
        name: user.name ?? user.email,
        inviteUrl: `${this.adminAppUrl}/reset-password?token=${issued.rawToken}&invite=1`,
        code: issued.code,
        expiresInHours: USER_INVITATION_TTL_HOURS,
        invitedBy: context.actorEmail ?? 'Administrador',
      });
    }

    return toUserDTO(user);
  }
}

// ------------------------------------------------------------
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly sessionService: AuthSessionService,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    userId: string,
    input: { name?: string; isActive?: boolean; roleIds?: string[] },
    context: ActorContext,
  ): Promise<UserDTO> {
    const user = await this.userRepository.findByIdWithRoles(userId);
    if (!user) throw new NotFoundError('Utilizador', userId);

    const isSelf = userId === context.actorId;
    if (isSelf && input.isActive === false) {
      throw new ForbiddenError('Não pode desativar a sua própria conta.');
    }
    if (isSelf && input.roleIds) {
      throw new ForbiddenError('Não pode alterar os seus próprios perfis — peça a outro administrador.');
    }

    if (input.roleIds) await assertRolesExist(this.roleRepository, input.roleIds);

    // Nunca deixar o sistema sem ninguém capaz de gerir perfis.
    const losesAdminAccess =
      input.isActive === false ||
      (input.roleIds !== undefined &&
        !(await this.roleRepository.findByIds(input.roleIds)).some((r) => r.permissions.includes(ADMIN_GUARD_PERMISSION)));
    const hasAdminAccess = user.isActive && user.roles.some((r) =>
      r.role.permissions.some((p) => p.permission.name === ADMIN_GUARD_PERMISSION),
    );
    if (hasAdminAccess && losesAdminAccess) {
      const others = await this.userRepository.countActiveWithPermission(ADMIN_GUARD_PERMISSION, userId);
      if (others === 0) {
        throw new BusinessRuleError('Este é o último administrador ativo — não pode perder o acesso de gestão.');
      }
    }

    const updated = await this.unitOfWork.run(async () => {
      await this.userRepository.update(userId, {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      });
      if (input.roleIds) await this.userRepository.setRoles(userId, input.roleIds);

      // Desativar ou mudar perfis termina as sessões: as novas permissões aplicam-se de imediato.
      if (input.isActive === false || input.roleIds) {
        await this.sessionService.revokeAllForSubject('user', userId);
      }

      const after = await this.userRepository.findByIdWithRoles(userId);
      await this.auditRepository.log({
        userId: context.actorId,
        action: input.roleIds ? 'PERMISSION_CHANGED' : 'USER_UPDATED',
        entity: 'User',
        entityId: userId,
        oldValues: { name: user.name, isActive: user.isActive, roles: user.roles.map((r) => r.role.name) },
        newValues: { name: after?.name, isActive: after?.isActive, roles: after?.roles.map((r) => r.role.name) },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      return after!;
    });

    return toUserDTO(updated);
  }
}
