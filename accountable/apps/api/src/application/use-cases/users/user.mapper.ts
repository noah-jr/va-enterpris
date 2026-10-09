import type { UserDTO } from '@accountable/types';
import type { UserWithRolesEntity } from '../../../domain/repositories/index.js';

export function toUserDTO(user: UserWithRolesEntity): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
    roles: user.roles.map((r) => r.role.name),
    roleIds: user.roles.map((r) => r.role.id),
  };
}

/** Permissão que dá acesso à gestão de perfis — tem de existir sempre num utilizador ativo. */
export const ADMIN_GUARD_PERMISSION = 'roles:manage';
