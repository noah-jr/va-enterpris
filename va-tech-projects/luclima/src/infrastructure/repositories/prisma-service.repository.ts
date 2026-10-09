import type {
    IServiceRepository,
    CreateServiceDTO,
    UpdateServiceDTO,
    ServiceFilters,
} from '@/domain/repositories';
import type { Service } from '@/domain/entities';
import { prisma } from '../database/prisma';

export class PrismaServiceRepository implements IServiceRepository {
    async findById(id: string): Promise<Service | null> {
        const service = await prisma.service.findUnique({
            where: { id },
            include: {
                sector: true,
            },
        });

        return service as Service | null;
    }

    async findAll(filters?: ServiceFilters): Promise<Service[]> {
        const where: any = {};

        if (filters?.sectorId) {
            where.sectorId = filters.sectorId;
        }

        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        const services = await prisma.service.findMany({
            where,
            include: {
                sector: true,
            },
            orderBy: {
                order: 'asc',
            },
        });

        return services as Service[];
    }

    async create(data: CreateServiceDTO): Promise<Service> {
        const service = await prisma.service.create({
            data: {
                name: data.name,
                description: data.description,
                image: data.image,
                sectorId: data.sectorId,
                order: data.order ?? 0,
                ...(data.isActive !== undefined && { isActive: data.isActive }),
            },
            include: {
                sector: true,
            },
        });

        return service as Service;
    }

    async update(id: string, data: UpdateServiceDTO): Promise<Service> {
        const service = await prisma.service.update({
            where: { id },
            data,
            include: {
                sector: true,
            },
        });

        return service as Service;
    }

    async delete(id: string): Promise<void> {
        await prisma.service.delete({
            where: { id },
        });
    }
}
