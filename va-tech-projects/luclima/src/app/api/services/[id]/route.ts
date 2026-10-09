import { NextRequest, NextResponse } from 'next/server';
import { ServiceUseCases } from '@/application/use-cases/service.use-cases';
import { serviceRepository } from '@/infrastructure/repositories';

const serviceUseCases = new ServiceUseCases(serviceRepository);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const service = await serviceUseCases.getServiceById(id);

        if (!service) {
            return NextResponse.json(
                { error: 'Serviço não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(service);
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Erro ao buscar serviço' },
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
        const updatedService = await serviceUseCases.updateService(id, body);

        return NextResponse.json(updatedService);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Erro ao atualizar serviço' },
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
        await serviceUseCases.deleteService(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Erro ao eliminar serviço' },
            { status: 400 }
        );
    }
}
