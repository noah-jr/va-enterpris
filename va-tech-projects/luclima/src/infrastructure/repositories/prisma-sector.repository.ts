import type {
    ISectorRepository,
    CreateSectorDTO,
    UpdateSectorDTO,
    SectorFilters,
} from '@/domain/repositories';
import type { Sector } from '@/domain/entities';
import { prisma } from '../database/prisma';

export class PrismaSectorRepository implements ISectorRepository {
    async findById(id: string): Promise<Sector | null> {
        const sector = await prisma.sector.findUnique({
            where: { id },
        });

        return sector as Sector | null;
    }

    async findByName(name: string): Promise<Sector | null> {
        const sector = await prisma.sector.findUnique({
            where: { name },
        });

        return sector as Sector | null;
    }

    async findAll(filters?: SectorFilters): Promise<Sector[]> {
        const where: any = {};

        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        const sectors = await prisma.sector.findMany({
            where,
            orderBy: {
                name: 'asc',
            },
        });

        return sectors as Sector[];
    }

    async create(data: CreateSectorDTO): Promise<Sector> {
        const sector = await prisma.sector.create({
            data: {
                name: data.name,
                description: data.description,
                ...(data.isActive !== undefined && { isActive: data.isActive }),
            },
        });

        return sector as Sector;
    }

    async update(id: string, data: UpdateSectorDTO): Promise<Sector> {
        const sector = await prisma.sector.update({
            where: { id },
            data,
        });

        return sector as Sector;
    }

    async delete(id: string): Promise<void> {
        await prisma.sector.delete({
            where: { id },
        });
    }
}
