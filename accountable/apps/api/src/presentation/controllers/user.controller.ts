import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ApiResponse, PermissionDTO, RoleDTO, UserDTO } from '@accountable/types';
import {
  createUserSchema,
  forgotPasswordSchema,
  roleSchema,
  updateRoleSchema,
  updateUserSchema,
  userFilterSchema,
} from '@accountable/schemas';
import type {
  CreateRoleUseCase,
  CreateUserUseCase,
  DeleteRoleUseCase,
  ListPermissionsUseCase,
  ListRolesUseCase,
  ListUsersUseCase,
  UpdateRoleUseCase,
  UpdateUserUseCase,
} from '../../application/use-cases/users/index.js';
import type { RequestPasswordResetUseCase } from '../../application/use-cases/auth/index.js';
import type { IUserRepository } from '../../domain/repositories/index.js';
import { NotFoundError, UnauthorizedError } from '../../domain/errors/index.js';

export interface UserControllerDependencies {
  listUsersUseCase: ListUsersUseCase;
  createUserUseCase: CreateUserUseCase;
  updateUserUseCase: UpdateUserUseCase;
  requestUserPasswordResetUseCase: RequestPasswordResetUseCase;
  listRolesUseCase: ListRolesUseCase;
  listPermissionsUseCase: ListPermissionsUseCase;
  createRoleUseCase: CreateRoleUseCase;
  updateRoleUseCase: UpdateRoleUseCase;
  deleteRoleUseCase: DeleteRoleUseCase;
  userRepository: IUserRepository;
}

type IdParams = FastifyRequest<{ Params: { id: string } }>;

export class UserController {
  constructor(private readonly deps: UserControllerDependencies) {}

  private actor(request: FastifyRequest) {
    if (!request.auth) throw new UnauthorizedError('Autenticação necessária');
    return {
      actorId: request.auth.sub,
      actorEmail: request.auth.email,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    };
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const filter = userFilterSchema.parse(request.query);
    reply.status(200).send(await this.deps.listUsersUseCase.execute(filter));
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = createUserSchema.parse(request.body);
    const user = await this.deps.createUserUseCase.execute(body, this.actor(request));
    const response: ApiResponse<UserDTO> = {
      data: user,
      message: body.password
        ? 'Utilizador criado com sucesso.'
        : 'Utilizador criado. Foi enviado um convite por email para definir a senha.',
    };
    reply.status(201).send(response);
  }

  async update(request: IdParams, reply: FastifyReply): Promise<void> {
    const body = updateUserSchema.parse(request.body);
    const user = await this.deps.updateUserUseCase.execute(request.params.id, body, this.actor(request));
    const response: ApiResponse<UserDTO> = { data: user, message: 'Utilizador atualizado com sucesso.' };
    reply.status(200).send(response);
  }

  /** O administrador pede o envio de um email de redefinição de senha para o utilizador. */
  async sendPasswordReset(request: IdParams, reply: FastifyReply): Promise<void> {
    const actor = this.actor(request);
    const user = await this.deps.userRepository.findById(request.params.id);
    if (!user) throw new NotFoundError('Utilizador', request.params.id);
    const { email } = forgotPasswordSchema.parse({ email: user.email });
    await this.deps.requestUserPasswordResetUseCase.execute(email, actor);
    const response: ApiResponse<null> = {
      data: null,
      message: `Enviámos um link e um código de redefinição para ${user.email}.`,
    };
    reply.status(200).send(response);
  }

  async listRoles(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const response: ApiResponse<RoleDTO[]> = { data: await this.deps.listRolesUseCase.execute() };
    reply.status(200).send(response);
  }

  async listPermissions(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const response: ApiResponse<PermissionDTO[]> = { data: await this.deps.listPermissionsUseCase.execute() };
    reply.status(200).send(response);
  }

  async createRole(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = roleSchema.parse(request.body);
    const role = await this.deps.createRoleUseCase.execute(body, this.actor(request));
    const response: ApiResponse<RoleDTO> = { data: role, message: 'Perfil criado com sucesso.' };
    reply.status(201).send(response);
  }

  async updateRole(request: IdParams, reply: FastifyReply): Promise<void> {
    const body = updateRoleSchema.parse(request.body);
    const role = await this.deps.updateRoleUseCase.execute(request.params.id, body, this.actor(request));
    const response: ApiResponse<RoleDTO> = { data: role, message: 'Perfil atualizado com sucesso.' };
    reply.status(200).send(response);
  }

  async deleteRole(request: IdParams, reply: FastifyReply): Promise<void> {
    await this.deps.deleteRoleUseCase.execute(request.params.id, this.actor(request));
    const response: ApiResponse<null> = { data: null, message: 'Perfil eliminado.' };
    reply.status(200).send(response);
  }
}
