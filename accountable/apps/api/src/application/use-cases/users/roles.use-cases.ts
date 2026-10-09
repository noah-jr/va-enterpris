import type { PermissionDTO, RoleDTO } from '@accountable/types';
import type { RoleInput } from '@accountable/schemas';
import {
  BusinessRuleError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../domain/errors/index.js';
import type { IAuditRepository, IRoleRepository, RoleEntity } from '../../../domain/repositories/index.js';
import type { IUnitOfWork } from '../../contracts/index.js';

/** O perfil de administração tem sempre todas as permissões (garantido pelo seed). */
export const SUPER_ADMIN_ROLE = 'ADMINISTRATOR';

const toDTO = (r: RoleEntity): RoleDTO => ({ ...r });

interface ActorContext {
  actorId: string;
  ipAddress?: string;
  userAgent?: string;
}

async function assertPermissionsExist(repo: IRoleRepository, names: string[]): Promise<void> {
  const known = new Set((await repo.listPermissions()).map((p) => p.name));
  const unknown = names.filter((n) => !known.has(n));
  if (unknown.length > 0) {
    throw new ValidationError(`Permissões desconhecidas: ${unknown.join(', ')}`);
  }
}

export class ListRolesUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}
  async execute(): Promise<RoleDTO[]> {
    return (await this.roleRepository.list()).map(toDTO);
  }
}

export class ListPermissionsUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}
  async execute(): Promise<PermissionDTO[]> {
    return this.roleRepository.listPermissions();
  }
}

export class CreateRoleUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(input: RoleInput, context: ActorContext): Promise<RoleDTO> {
    if (await this.roleRepository.findByName(input.name)) {
      throw new ConflictError('Já existe um perfil com este nome.');
    }
    await assertPermissionsExist(this.roleRepository, input.permissions);

    return this.unitOfWork.run(async () => {
      const role = await this.roleRepository.create({
        name: input.name,
        description: input.description ?? null,
        permissions: [...new Set(input.permissions)],
      });
      await this.auditRepository.log({
        userId: context.actorId,
        action: 'ROLE_CREATED',
        entity: 'Role',
        entityId: role.id,
        newValues: { name: role.name, permissions: role.permissions },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      return toDTO(role);
    });
  }
}

export class UpdateRoleUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(roleId: string, input: Partial<RoleInput>, context: ActorContext): Promise<RoleDTO> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) throw new NotFoundError('Perfil', roleId);

    if (role.isSystem && input.name !== undefined && input.name !== role.name) {
      throw new BusinessRuleError('Os perfis de sistema não podem ser renomeados.');
    }
    if (role.name === SUPER_ADMIN_ROLE && input.permissions !== undefined) {
      throw new BusinessRuleError('O perfil ADMINISTRATOR tem sempre todas as permissões.');
    }
    if (input.name && input.name !== role.name && (await this.roleRepository.findByName(input.name))) {
      throw new ConflictError('Já existe um perfil com este nome.');
    }
    if (input.permissions) await assertPermissionsExist(this.roleRepository, input.permissions);

    return this.unitOfWork.run(async () => {
      const updated = await this.roleRepository.update(roleId, {
        name: input.name,
        description: input.description,
        permissions: input.permissions ? [...new Set(input.permissions)] : undefined,
      });
      await this.auditRepository.log({
        userId: context.actorId,
        action: 'ROLE_UPDATED',
        entity: 'Role',
        entityId: roleId,
        oldValues: { name: role.name, permissions: role.permissions },
        newValues: { name: updated.name, permissions: updated.permissions },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
      return toDTO(updated);
    });
  }
}

export class DeleteRoleUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(roleId: string, context: ActorContext): Promise<void> {
    const role = await this.roleRepository.findById(roleId);
    if (!role) throw new NotFoundError('Perfil', roleId);
    if (role.isSystem) throw new BusinessRuleError('Os perfis de sistema não podem ser eliminados.');
    if (role.usersCount > 0) {
      throw new BusinessRuleError(`Este perfil está atribuído a ${role.usersCount} utilizador(es). Reatribua-os primeiro.`);
    }

    await this.unitOfWork.run(async () => {
      await this.roleRepository.delete(roleId);
      await this.auditRepository.log({
        userId: context.actorId,
        action: 'ROLE_DELETED',
        entity: 'Role',
        entityId: roleId,
        oldValues: { name: role.name, permissions: role.permissions },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    });
  }
}
