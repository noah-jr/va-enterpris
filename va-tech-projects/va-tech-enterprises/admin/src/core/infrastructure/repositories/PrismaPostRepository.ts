import { IPostRepository } from "@/core/domain/repositories/IPostRepository";
import { Post } from "@/core/domain/entities/Post";
import { prisma } from "@/lib/prisma";

export class PrismaPostRepository implements IPostRepository {
    async count(options?: { publishedOnly?: boolean; search?: string; status?: string }): Promise<number> {
        const where: any = {};
        if (options?.publishedOnly) {
            where.published = true;
        }
        if (options?.status) {
            if (options.status === 'published') where.published = true;
            if (options.status === 'draft') where.published = false;
        }
        if (options?.search) {
            where.OR = [
                { title: { contains: options.search, mode: 'insensitive' } },
                { content: { contains: options.search, mode: 'insensitive' } }
            ];
        }
        return await prisma.post.count({ where });
    }

    async findAll(options?: { publishedOnly?: boolean; search?: string; status?: string; page?: number; limit?: number }): Promise<Post[]> {
        const where: any = {};
        if (options?.publishedOnly) {
            where.published = true;
        }
        if (options?.status) {
            if (options.status === 'published') where.published = true;
            if (options.status === 'draft') where.published = false;
        }
        if (options?.search) {
            where.OR = [
                { title: { contains: options.search, mode: 'insensitive' } },
                { content: { contains: options.search, mode: 'insensitive' } }
            ];
        }

        const queryOptions: any = {
            where,
            orderBy: { createdAt: 'desc' }
        };

        if (options?.page && options?.limit) {
            queryOptions.skip = (options.page - 1) * options.limit;
            queryOptions.take = options.limit;
        }

        const posts = await prisma.post.findMany(queryOptions);
        return posts as Post[];
    }

    async findById(id: string): Promise<Post | null> {
        const post = await prisma.post.findUnique({ where: { id } });
        return post as Post | null;
    }

    async findBySlug(slug: string): Promise<Post | null> {
        const post = await prisma.post.findUnique({ where: { slug } });
        return post as Post | null;
    }

    async create(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
        const post = await prisma.post.create({
            data: {
                slug: data.slug,
                title: data.title,
                content: data.content,
                excerpt: data.excerpt,
                coverImage: data.coverImage,
                published: data.published,
                tags: data.tags,
                authorId: data.authorId
            }
        });
        return post as Post;
    }

    async update(id: string, data: Partial<Omit<Post, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Post> {
        const updateData: any = { ...data };
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const post = await prisma.post.update({
            where: { id },
            data: updateData
        });
        return post as Post;
    }

    async delete(id: string): Promise<void> {
        await prisma.post.delete({ where: { id } });
    }
}
