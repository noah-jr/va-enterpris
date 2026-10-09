import { NextRequest, NextResponse } from 'next/server';
import { newsletterRepository } from '@/infrastructure/repositories';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const isActive = searchParams.get('isActive');

        const filters: { isActive?: boolean } = {};
        if (isActive === 'true') filters.isActive = true;
        if (isActive === 'false') filters.isActive = false;

        const subscribers = await newsletterRepository.findAll(filters);

        return NextResponse.json(
            { subscribers },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Get newsletter subscribers error:', error);
        return NextResponse.json(
            { error: 'Erro ao obter subscritores' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
        }

        await newsletterRepository.delete(id);

        return NextResponse.json({ message: 'Subscritor removido com sucesso' });
    } catch (error) {
        console.error('Delete subscriber error:', error);
        return NextResponse.json({ error: 'Erro ao remover subscritor' }, { status: 500 });
    }
}
