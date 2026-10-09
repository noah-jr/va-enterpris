import { NextRequest, NextResponse } from 'next/server';
import { PostUseCases } from '@/application/use-cases/post.use-cases';
import { postRepository } from '@/infrastructure/repositories';

const postUseCases = new PostUseCases(postRepository);

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const post = await postUseCases.getBySlug(slug);
        if (!post) {
            return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
        }
        return NextResponse.json(post);
    } catch (error: unknown) {
        console.error('Get post by slug error:', error);
        return NextResponse.json({ error: 'Erro ao obter post' }, { status: 500 });
    }
}
