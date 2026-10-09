import { NextRequest, NextResponse } from 'next/server';
import { CategoryUseCases } from '@/application/use-cases/category.use-cases';
import { categoryRepository } from '@/infrastructure/repositories';

const categoryUseCases = new CategoryUseCases(categoryRepository);

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const category = await categoryUseCases.getById(id);
        if (!category) {
            return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
        }
        return NextResponse.json(category);
    } catch (error: unknown) {
        console.error('Get category error:', error);
        return NextResponse.json({ error: 'Erro ao obter categoria' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const category = await categoryUseCases.update(id, {
            name: body.name,
            slug: body.slug,
        });
        return NextResponse.json(category);
    } catch (error: unknown) {
        console.error('Update category error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao atualizar categoria' },
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
        await categoryUseCases.delete(id);
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Delete category error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao eliminar categoria' },
            { status: 500 }
        );
    }
}
