import {
  CreateRoleUseCase,
  CreateUserUseCase,
  DeleteRoleUseCase,
  ListPermissionsUseCase,
  ListRolesUseCase,
  ListUsersUseCase,
  UpdateRoleUseCase,
  UpdateUserUseCase,
} from '../application/use-cases/users/index.js';
import { RequestPasswordResetUseCase } from '../application/use-cases/auth/index.js';
import { UserController } from '../presentation/controllers/user.controller.js';
import type { Infrastructure } from './infrastructure.js';

export function buildUserController(infra: Infrastructure): UserController {
  const { repositories, hasher, emailTokens, emailService, unitOfWork, sessionService, config } = infra;
  const { userRepository, roleRepository, auditRepository } = repositories;

  return new UserController({
    listUsersUseCase: new ListUsersUseCase(userRepository),
    createUserUseCase: new CreateUserUseCase(
      userRepository,
      roleRepository,
      hasher,
      emailTokens,
      emailService,
      auditRepository,
      unitOfWork,
      config.adminUrl,
    ),
    updateUserUseCase: new UpdateUserUseCase(userRepository, roleRepository, sessionService, auditRepository, unitOfWork),
    requestUserPasswordResetUseCase: new RequestPasswordResetUseCase(
      {
        kind: 'USER_PASSWORD_RESET',
        sessionType: 'user',
        resetPageUrl: `${config.adminUrl}/reset-password`,
        entity: 'User',
        async findEligibleByEmail(email) {
          const user = await userRepository.findByEmail(email);
          return user && user.isActive ? { id: user.id, name: user.name ?? user.email, email: user.email } : null;
        },
        async findIdByEmail(email) {
          return (await userRepository.findByEmail(email))?.id ?? null;
        },
        async setPassword(id, passwordHash) {
          await userRepository.update(id, { passwordHash });
        },
        auditActor: (id) => ({ userId: id }),
      },
      emailTokens,
      emailService,
      auditRepository,
    ),
    listRolesUseCase: new ListRolesUseCase(roleRepository),
    listPermissionsUseCase: new ListPermissionsUseCase(roleRepository),
    createRoleUseCase: new CreateRoleUseCase(roleRepository, auditRepository, unitOfWork),
    updateRoleUseCase: new UpdateRoleUseCase(roleRepository, auditRepository, unitOfWork),
    deleteRoleUseCase: new DeleteRoleUseCase(roleRepository, auditRepository, unitOfWork),
    userRepository,
  });
}
