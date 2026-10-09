import { NextRequest, NextResponse } from 'next/server';
import { SectorUseCases } from '@/application/use-cases/sector.use-cases';
import { sectorRepository } from '@/infrastructure/repositories';

const sectorUseCases = new SectorUseCases(sectorRepository);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const isActive = searchParams.get('isActive');

        const filters: { isActive?: boolean } = {};

        if (isActive === 'true' || isActive === 'false') {
            filters.isActive = isActive === 'true';
        }

        const sectors = await sectorUseCases.getAllSectors(filters);

        return NextResponse.json({ sectors }, { status: 200 });
    } catch (error: any) {
        console.error('Get sectors error:', error);
        return NextResponse.json(
            {
                error: 'Erro ao obter sectores',
                details: error.message,
                stack: error.stack
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Simple validation
        if (!body.name) {
            return NextResponse.json(
                { error: 'Nome é obrigatório' },
                { status: 400 }
            );
        }

        const sector = await sectorUseCases.createSector({
            name: body.name,
            description: body.description,
            isActive: body.isActive ?? true,
        });

        return NextResponse.json(sector, { status: 201 });
    } catch (error: any) {
        console.error('Create sector error:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao criar sector' },
            { status: 500 }
        );
    }
}
