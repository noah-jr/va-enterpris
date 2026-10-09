import type { Prisma, PrismaClient } from '@prisma/client';
import type {
  IUserRepository,
  UserEntity,
  UserWithRolesEntity,
} from '../../../domain/repositories/user.repository.interface.js';

const WITH_ROLES = {
  roles: {
    include: {
      role: { include: { rolePermissions: { include: { permission: true } } } },
    },
  },
} satisfies Prisma.UserInclude;

type UserWithRolesRow = Prisma.UserGetPayload<{ include: typeof WITH_ROLES }>;

function toWithRoles(user: UserWithRolesRow): UserWithRolesEntity {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    passwordHash: user.passwordHash,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
    roles: user.roles.map((ur) => ({
      role: {
        id: ur.role.id,
        name: ur.role.name,
        permissions: ur.role.rolePermissions.map((rp) => ({ permission: { name: rp.permission.name } })),
      },
    })),
  };
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  async findByIdWithRoles(id: string): Promise<UserWithRolesEntity | null> {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null }, include: WITH_ROLES });
    return user ? toWithRoles(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  async create(data: { email: string; name: string | null; passwordHash: string; roleIds: string[] }): Promise<UserEntity> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        roles: { create: data.roleIds.map((roleId) => ({ roleId })) },
      },
    });
  }

  async update(id: string, data: Partial<Omit<UserEntity, 'id' | 'createdAt'>>): Promise<UserEntity> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async setRoles(id: string, roleIds: string[]): Promise<void> {
    await this.prisma.userRole.deleteMany({ where: { userId: id } });
    await this.prisma.userRole.createMany({ data: roleIds.map((roleId) => ({ userId: id, roleId })) });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async list(params: { page: number; perPage: number; search?: string }): Promise<{ items: UserWithRolesEntity[]; total: number }> {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(params.search
        ? { OR: [{ email: { contains: params.search } }, { name: { contains: params.search } }] }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: WITH_ROLES,
        skip: (params.page - 1) * params.perPage,
        take: params.perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items: rows.map(toWithRoles), total };
  }

  async countActiveWithPermission(permission: string, excludeUserId?: string): Promise<number> {
    return this.prisma.user.count({
      where: {
        deletedAt: null,
        isActive: true,
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
        roles: { some: { role: { rolePermissions: { some: { permission: { name: permission } } } } } },
      },
    });
  }
}
