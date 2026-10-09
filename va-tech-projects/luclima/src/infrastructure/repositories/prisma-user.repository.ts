import type {
    IUserRepository,
    CreateUserDTO,
    UpdateUserDTO,
    UserFilters,
} from '@/domain/repositories';
import type { User } from '@/domain/entities';
import { prisma } from '../database/prisma';

export class PrismaUserRepository implements IUserRepository {
    async findById(id: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                sector: true,
            },
        });

        return user as User | null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                sector: true,
            },
        });

        return user as User | null;
    }

    async findAll(filters?: UserFilters): Promise<User[]> {
        const where: any = {};

        if (filters?.role) {
            where.role = filters.role;
        }

        if (filters?.sectorId) {
            where.sectorId = filters.sectorId;
        }

        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search } },
                { email: { contains: filters.search } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            include: {
                sector: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return users as User[];
    }

    async create(data: CreateUserDTO): Promise<User> {
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role as any,
                sectorId: data.sectorId,
                avatar: data.avatar,
            },
            include: {
                sector: true,
            },
        });

        return user as User;
    }

    async update(id: string, data: UpdateUserDTO): Promise<User> {
        const updateData: any = {};

        if (data.name) updateData.name = data.name;
        if (data.email) updateData.email = data.email;
        if (data.password) updateData.password = data.password;
        if (data.role) updateData.role = data.role;
        if (data.sectorId !== undefined) updateData.sectorId = data.sectorId;
        if (data.avatar !== undefined) updateData.avatar = data.avatar;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;
        if (data.qrCode !== undefined) updateData.qrCode = data.qrCode;

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            include: {
                sector: true,
            },
        });

        return user as User;
    }

    async delete(id: string): Promise<void> {
        await prisma.user.delete({
            where: { id },
        });
    }

    async count(filters?: UserFilters): Promise<number> {
        const where: any = {};

        if (filters?.role) {
            where.role = filters.role;
        }

        if (filters?.sectorId) {
            where.sectorId = filters.sectorId;
        }

        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        return prisma.user.count({ where });
    }
}
