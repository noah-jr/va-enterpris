import { IServiceRepository } from "@/core/domain/repositories/IServiceRepository";
import { Service } from "@/core/domain/entities/Service";
import { prisma } from "@/lib/prisma";

export class PrismaServiceRepository implements IServiceRepository {
    async findAll(options?: { activeOnly?: boolean }): Promise<Service[]> {
        const where: any = {};
        if (options?.activeOnly) {
            where.active = true;
        }

        const services = await prisma.service.findMany({
            where,
            include: { features: true }
        });
        return services.map(this.mapToEntity);
    }

    async findById(id: string): Promise<Service | null> {
        const service = await prisma.service.findUnique({
            where: { id },
            include: { features: true }
        });
        return service ? this.mapToEntity(service) : null;
    }

    async findBySlug(slug: string): Promise<Service | null> {
        const service = await prisma.service.findUnique({
            where: { slug },
            include: { features: true }
        });
        return service ? this.mapToEntity(service) : null;
    }

    async create(data: Omit<Service, 'id'>): Promise<Service> {
        const service = await prisma.service.create({
            data: {
                slug: data.slug,
                title: data.title,
                description: data.description,
                longDescription: data.longDescription,
                category: data.category,
                icon: data.icon,
                image: data.image,
                active: data.active,
                features: {
                    create: data.features.map(f => ({ text: f }))
                }
            },
            include: { features: true }
        });
        return this.mapToEntity(service);
    }

    async update(id: string, data: Partial<Service>): Promise<Service> {
        const updateData: any = {
            slug: data.slug,
            title: data.title,
            description: data.description,
            longDescription: data.longDescription,
            category: data.category,
            icon: data.icon,
            image: data.image,
            active: data.active,
        };

        if (data.features) {
            updateData.features = {
                deleteMany: {},
                create: data.features.map(f => ({ text: f }))
            };
        }

        // Remover campos undefined para não sobrescrever com null/undefined acidentalmente
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const service = await prisma.service.update({
            where: { id },
            data: updateData,
            include: { features: true }
        });
        return this.mapToEntity(service);
    }

    async delete(id: string): Promise<void> {
        await prisma.service.delete({ where: { id } });
    }

    private mapToEntity(prismaService: any): Service {
        return {
            id: prismaService.id,
            slug: prismaService.slug,
            title: prismaService.title,
            description: prismaService.description,
            longDescription: prismaService.longDescription,
            category: prismaService.category,
            icon: prismaService.icon,
            image: prismaService.image,
            active: prismaService.active,
            features: prismaService.features ? prismaService.features.map((f: any) => f.text) : []
        };
    }
}
