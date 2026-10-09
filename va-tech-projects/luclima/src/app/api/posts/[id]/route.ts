import { NextRequest, NextResponse } from 'next/server';
import { PostUseCases } from '@/application/use-cases/post.use-cases';
import { postRepository } from '@/infrastructure/repositories';

const postUseCases = new PostUseCases(postRepository);

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const post = await postUseCases.getById(id);
        if (!post) {
            return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
        }
        return NextResponse.json(post);
    } catch (error: unknown) {
        console.error('Get post error:', error);
        return NextResponse.json({ error: 'Erro ao obter post' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updateData: {
            title?: string;
            slug?: string;
            content?: string;
            excerpt?: string;
            image?: string;
            status?: string;
            metaTitle?: string;
            metaDescription?: string;
            categoryId?: string;
            publishedAt?: Date;
        } = {};
        if (body.title !== undefined) updateData.title = body.title;
        if (body.slug !== undefined) updateData.slug = body.slug;
        if (body.content !== undefined) updateData.content = body.content;
        if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
        if (body.image !== undefined) updateData.image = body.image;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle;
        if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription;
        if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
        if (body.status === 'PUBLISHED' && body.publishedAt !== undefined) {
            updateData.publishedAt = body.publishedAt ? new Date(body.publishedAt) : new Date();
        }

        const post = await postUseCases.update(id, updateData);
        return NextResponse.json(post);
    } catch (error: unknown) {
        console.error('Update post error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao atualizar post' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await postUseCases.delete(id);
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Delete post error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao eliminar post' },
            { status: 500 }
        );
    }
}
