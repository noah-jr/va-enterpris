import { NextRequest, NextResponse } from 'next/server';
import { CategoryUseCases } from '@/application/use-cases/category.use-cases';
import { categoryRepository } from '@/infrastructure/repositories';

const categoryUseCases = new CategoryUseCases(categoryRepository);

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export async function GET() {
    try {
        const categories = await categoryUseCases.getAll();
        return NextResponse.json({ categories }, { status: 200 });
    } catch (error: unknown) {
        console.error('Get categories error:', error);
        return NextResponse.json(
            { error: 'Erro ao obter categorias' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const name = body.name?.trim();
        const slug = body.slug?.trim() || (name ? slugify(name) : '');

        if (!name || !slug) {
            return NextResponse.json(
                { error: 'Nome é obrigatório' },
                { status: 400 }
            );
        }

        const category = await categoryUseCases.create({ name, slug });
        return NextResponse.json(category, { status: 201 });
    } catch (error: unknown) {
        console.error('Create category error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao criar categoria' },
            { status: 500 }
        );
    }
}
