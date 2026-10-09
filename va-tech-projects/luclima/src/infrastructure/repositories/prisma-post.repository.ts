import type {
    IPostRepository,
    CreatePostDTO,
    UpdatePostDTO,
    PostFilters,
} from '@/domain/repositories';
import type { Post } from '@/domain/entities';
import type { PostStatus } from '@prisma/client';
import { prisma } from '../database/prisma';

export class PrismaPostRepository implements IPostRepository {
    async findById(id: string): Promise<Post | null> {
        const post = await prisma.post.findUnique({
            where: { id },
            include: { category: true, author: true },
        });
        return post as Post | null;
    }

    async findBySlug(slug: string): Promise<Post | null> {
        const post = await prisma.post.findUnique({
            where: { slug },
            include: { category: true, author: true },
        });
        return post as Post | null;
    }

    async findAll(filters?: PostFilters): Promise<Post[]> {
        const where: { status?: PostStatus; categoryId?: string; authorId?: string } = {};
        if (filters?.status) where.status = filters.status as PostStatus;
        if (filters?.categoryId) where.categoryId = filters.categoryId;
        if (filters?.authorId) where.authorId = filters.authorId;

        const posts = await prisma.post.findMany({
            where,
            include: { category: true, author: true },
            orderBy: { createdAt: 'desc' },
        });
        return posts as Post[];
    }

    async create(data: CreatePostDTO): Promise<Post> {
        const post = await prisma.post.create({
            data: {
                title: data.title,
                slug: data.slug,
                content: data.content,
                excerpt: data.excerpt,
                image: data.image,
                status: (data.status as 'DRAFT' | 'PUBLISHED') ?? 'DRAFT',
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                categoryId: data.categoryId,
                authorId: data.authorId,
            },
            include: { category: true, author: true },
        });
        return post as Post;
    }

    async update(id: string, data: UpdatePostDTO): Promise<Post> {
        const updateData: Record<string, unknown> = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.slug !== undefined) updateData.slug = data.slug;
        if (data.content !== undefined) updateData.content = data.content;
        if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
        if (data.image !== undefined) updateData.image = data.image;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
        if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
        if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
        if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt;

        const post = await prisma.post.update({
            where: { id },
            data: updateData as Parameters<typeof prisma.post.update>[0]['data'],
            include: { category: true, author: true },
        });
        return post as Post;
    }

    async delete(id: string): Promise<void> {
        await prisma.post.delete({ where: { id } });
    }
}
