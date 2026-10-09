import { NextRequest, NextResponse } from 'next/server';
import { serviceRequestRepository } from '@/infrastructure/repositories';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, serviceId, sectorId, description } = body;

        // Validation
        if (!name || !email || !phone || !serviceId || !sectorId || !description) {
            return NextResponse.json(
                { error: 'Todos os campos são obrigatórios' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Email inválido' },
                { status: 400 }
            );
        }

        // Create service request
        const serviceRequest = await serviceRequestRepository.create({
            name,
            email,
            phone,
            serviceId,
            sectorId,
            description,
        });

        return NextResponse.json(
            {
                message: 'Solicitação criada com sucesso!',
                serviceRequest: {
                    id: serviceRequest.id,
                    status: serviceRequest.status,
                }
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Service request creation error:', error);
        return NextResponse.json(
            { error: 'Erro ao criar solicitação' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const sectorId = searchParams.get('sectorId');

        const filters: any = {};

        if (status) {
            filters.status = status;
        }

        if (sectorId) {
            filters.sectorId = sectorId;
        }

        const requests = await serviceRequestRepository.findAll(filters);

        return NextResponse.json({ requests }, { status: 200 });
    } catch (error: any) {
        console.error('Get service requests error:', error);
        return NextResponse.json(
            { error: 'Erro ao obter solicitações' },
            { status: 500 }
        );
    }
}
