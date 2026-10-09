import { NextRequest, NextResponse } from 'next/server';
import { SectorUseCases } from '@/application/use-cases/sector.use-cases';
import { sectorRepository } from '@/infrastructure/repositories';

const sectorUseCases = new SectorUseCases(sectorRepository);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const sector = await sectorUseCases.getSectorById(id);

        if (!sector) {
            return NextResponse.json(
                { error: 'Sector não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(sector);
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Erro ao buscar sector' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const updatedSector = await sectorUseCases.updateSector(id, body);

        return NextResponse.json(updatedSector);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Erro ao atualizar sector' },
            { status: 400 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await sectorUseCases.deleteSector(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Erro ao eliminar sector' },
            { status: 400 }
        );
    }
}
