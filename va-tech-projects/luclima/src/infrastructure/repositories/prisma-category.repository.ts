import type {
    ICategoryRepository,
    CreateCategoryDTO,
    UpdateCategoryDTO,
} from '@/domain/repositories';
import type { Category } from '@/domain/entities';
import { prisma } from '../database/prisma';

export class PrismaCategoryRepository implements ICategoryRepository {
    async findById(id: string): Promise<Category | null> {
        const category = await prisma.category.findUnique({
            where: { id },
        });
        return category as Category | null;
    }

    async findBySlug(slug: string): Promise<Category | null> {
        const category = await prisma.category.findUnique({
            where: { slug },
        });
        return category as Category | null;
    }

    async findAll(): Promise<Category[]> {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
        return categories as Category[];
    }

    async create(data: CreateCategoryDTO): Promise<Category> {
        const category = await prisma.category.create({
            data: {
                name: data.name,
                slug: data.slug,
            },
        });
        return category as Category;
    }

    async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
        const category = await prisma.category.update({
            where: { id },
            data,
        });
        return category as Category;
    }

    async delete(id: string): Promise<void> {
        await prisma.category.delete({ where: { id } });
    }
}
