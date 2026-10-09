import type {
    IProjectRepository,
    CreateProjectDTO,
    UpdateProjectDTO,
    ProjectFilters,
} from '@/domain/repositories';
import type { Project } from '@/domain/entities';
import { prisma } from '../database/prisma';

function parseImages(imagesJson: string): string[] {
    try {
        const parsed = JSON.parse(imagesJson) as unknown;
        return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
        return [];
    }
}

export class PrismaProjectRepository implements IProjectRepository {
    async findById(id: string): Promise<Project | null> {
        const project = await prisma.project.findUnique({
            where: { id },
            include: { sector: true, user: true },
        });
        if (!project) return null;
        return {
            ...project,
            images: parseImages(project.images),
        } as Project;
    }

    async findAll(filters?: ProjectFilters): Promise<Project[]> {
        const where: { sectorId?: string; status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'; userId?: string } = {};
        if (filters?.sectorId) where.sectorId = filters.sectorId;
        if (filters?.status) where.status = filters.status as 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
        if (filters?.userId) where.userId = filters.userId;

        const projects = await prisma.project.findMany({
            where,
            include: { sector: true, user: true },
            orderBy: { createdAt: 'desc' },
        });

        return projects.map((p) => ({
            ...p,
            images: parseImages(p.images),
        })) as Project[];
    }

    async create(data: CreateProjectDTO): Promise<Project> {
        const project = await prisma.project.create({
            data: {
                title: data.title,
                description: data.description,
                images: JSON.stringify(data.images ?? []),
                sectorId: data.sectorId,
                userId: data.userId,
                status: (data.status as 'ACTIVE' | 'COMPLETED' | 'ARCHIVED') ?? 'ACTIVE',
            },
            include: { sector: true, user: true },
        });
        return {
            ...project,
            images: parseImages(project.images),
        } as Project;
    }

    async update(id: string, data: UpdateProjectDTO): Promise<Project> {
        const updatePayload: Record<string, unknown> = {};
        if (data.title !== undefined) updatePayload.title = data.title;
        if (data.description !== undefined) updatePayload.description = data.description;
        if (data.images !== undefined) updatePayload.images = JSON.stringify(data.images);
        if (data.status !== undefined) updatePayload.status = data.status;
        if (data.completedAt !== undefined) updatePayload.completedAt = data.completedAt;

        const project = await prisma.project.update({
            where: { id },
            data: updatePayload as Parameters<typeof prisma.project.update>[0]['data'],
            include: { sector: true, user: true },
        });
        return {
            ...project,
            images: parseImages(project.images),
        } as Project;
    }

    async delete(id: string): Promise<void> {
        await prisma.project.delete({ where: { id } });
    }
}
