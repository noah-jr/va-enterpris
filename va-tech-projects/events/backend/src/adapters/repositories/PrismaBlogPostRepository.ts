import { BlogPost, Comment, PrismaClient } from '@prisma/client';
import { IBlogPostRepository, CreateBlogPostDTO } from '../../core/repositories/IBlogPostRepository';
import { prisma } from '../../infrastructure/database/prisma';

export class PrismaBlogPostRepository implements IBlogPostRepository {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = prisma;
    }

    async create(data: CreateBlogPostDTO): Promise<BlogPost> {
        return this.prisma.blogPost.create({ data });
    }

    async findAll(): Promise<BlogPost[]> {
        return this.prisma.blogPost.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string): Promise<(BlogPost & { comments: Comment[] }) | null> {
        return this.prisma.blogPost.findUnique({
            where: { id },
            include: { comments: { include: { user: true } } },
        });
    }

    async update(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
        return this.prisma.blogPost.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.blogPost.delete({ where: { id } });
    }

    async addComment(data: any): Promise<Comment> {
        return this.prisma.comment.create({
            data,
        });
    }
}
