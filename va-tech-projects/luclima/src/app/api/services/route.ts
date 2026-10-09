import { NextRequest, NextResponse } from 'next/server';
import { ServiceUseCases } from '@/application/use-cases/service.use-cases';
import { serviceRepository } from '@/infrastructure/repositories';

const serviceUseCases = new ServiceUseCases(serviceRepository);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sectorId = searchParams.get('sectorId');
        const isActive = searchParams.get('isActive');

        const filters: { sectorId?: string; isActive?: boolean } = {};

        if (sectorId) {
            filters.sectorId = sectorId;
        }

        if (isActive === 'true' || isActive === 'false') {
            filters.isActive = isActive === 'true';
        }

        const services = await serviceUseCases.getAllServices(filters);

        return NextResponse.json({ services }, { status: 200 });
    } catch (error: any) {
        console.error('Get services error:', error);
        return NextResponse.json(
            { error: 'Erro ao obter serviços' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Simple validation
        if (!body.name || !body.sectorId) {
            return NextResponse.json(
                { error: 'Nome e Sector são obrigatórios' },
                { status: 400 }
            );
        }

        const service = await serviceUseCases.createService({
            name: body.name,
            description: body.description,
            sectorId: body.sectorId,
            isActive: body.isActive ?? true,
            order: body.order,
        });

        return NextResponse.json(service, { status: 201 });
    } catch (error: any) {
        console.error('Create service error:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao criar serviço' },
            { status: 500 }
        );
    }
}
