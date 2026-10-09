import type { Prisma, PrismaClient } from '@prisma/client';
import type {
  IRoleRepository,
  PermissionEntity,
  RoleEntity,
} from '../../../domain/repositories/user.repository.interface.js';

const ROLE_INCLUDE = {
  rolePermissions: { include: { permission: true } },
  _count: { select: { userRoles: { where: { user: { deletedAt: null } } } } },
} satisfies Prisma.RoleInclude;

type RoleRow = Prisma.RoleGetPayload<{ include: typeof ROLE_INCLUDE }>;

function toEntity(role: RoleRow): RoleEntity {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    permissions: role.rolePermissions.map((rp) => rp.permission.name).sort(),
    usersCount: role._count.userRoles,
  };
}

export class PrismaRoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(): Promise<RoleEntity[]> {
    const roles = await this.prisma.role.findMany({ include: ROLE_INCLUDE, orderBy: { name: 'asc' } });
    return roles.map(toEntity);
  }

  async findById(id: string): Promise<RoleEntity | null> {
    const role = await this.prisma.role.findUnique({ where: { id }, include: ROLE_INCLUDE });
    return role ? toEntity(role) : null;
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    const role = await this.prisma.role.findUnique({ where: { name }, include: ROLE_INCLUDE });
    return role ? toEntity(role) : null;
  }

  async findByIds(ids: string[]): Promise<RoleEntity[]> {
    const roles = await this.prisma.role.findMany({ where: { id: { in: ids } }, include: ROLE_INCLUDE });
    return roles.map(toEntity);
  }

  private async permissionIds(names: string[]): Promise<string[]> {
    const permissions = await this.prisma.permission.findMany({ where: { name: { in: names } } });
    return permissions.map((p) => p.id);
  }

  async create(data: { name: string; description: string | null; permissions: string[] }): Promise<RoleEntity> {
    const ids = await this.permissionIds(data.permissions);
    const role = await this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        rolePermissions: { create: ids.map((permissionId) => ({ permissionId })) },
      },
      include: ROLE_INCLUDE,
    });
    return toEntity(role);
  }

  async update(
    id: string,
    data: { name?: string; description?: string | null; permissions?: string[] },
  ): Promise<RoleEntity> {
    if (data.permissions) {
      const ids = await this.permissionIds(data.permissions);
      await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
      await this.prisma.rolePermission.createMany({ data: ids.map((permissionId) => ({ roleId: id, permissionId })) });
    }
    const role = await this.prisma.role.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
      },
      include: ROLE_INCLUDE,
    });
    return toEntity(role);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({ where: { id } });
  }

  async listPermissions(): Promise<PermissionEntity[]> {
    return this.prisma.permission.findMany({ orderBy: { name: 'asc' } });
  }
}
