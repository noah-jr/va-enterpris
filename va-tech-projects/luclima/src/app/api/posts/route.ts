import { NextRequest, NextResponse } from 'next/server';
import { PostUseCases } from '@/application/use-cases/post.use-cases';
import { postRepository } from '@/infrastructure/repositories';

const postUseCases = new PostUseCases(postRepository);

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const categoryId = searchParams.get('categoryId');
        const authorId = searchParams.get('authorId');

        const filters: { status?: string; categoryId?: string; authorId?: string } = {};
        if (status) filters.status = status;
        if (categoryId) filters.categoryId = categoryId;
        if (authorId) filters.authorId = authorId;

        const posts = await postUseCases.getAll(filters);
        return NextResponse.json({ posts }, { status: 200 });
    } catch (error: unknown) {
        console.error('Get posts error:', error);
        return NextResponse.json({ error: 'Erro ao obter posts' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            title,
            slug: slugInput,
            content,
            excerpt,
            image,
            status,
            metaTitle,
            metaDescription,
            categoryId,
            authorId,
        } = body;

        if (!title || !categoryId || !authorId) {
            return NextResponse.json(
                { error: 'Título, categoria e autor são obrigatórios' },
                { status: 400 }
            );
        }

        const slug = slugInput?.trim() || (title ? slugify(title) : '');
        if (!slug) {
            return NextResponse.json(
                { error: 'Slug é obrigatório' },
                { status: 400 }
            );
        }

        const post = await postUseCases.create({
            title,
            slug,
            content: content ?? '',
            excerpt: excerpt || undefined,
            image: image || undefined,
            status: status ?? 'DRAFT',
            metaTitle: metaTitle || undefined,
            metaDescription: metaDescription || undefined,
            categoryId,
            authorId,
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error: unknown) {
        console.error('Create post error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao criar post' },
            { status: 500 }
        );
    }
}
