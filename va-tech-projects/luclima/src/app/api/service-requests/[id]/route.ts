import { NextRequest, NextResponse } from 'next/server';
import { serviceRequestRepository } from '@/infrastructure/repositories';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const request = await serviceRequestRepository.findById(id);

        if (!request) {
            return NextResponse.json(
                { error: 'Solicitação não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(request);
    } catch (error: unknown) {
        console.error('Get service request error:', error);
        return NextResponse.json(
            { error: 'Erro ao obter solicitação' },
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

        const existing = await serviceRequestRepository.findById(id);
        if (!existing) {
            return NextResponse.json(
                { error: 'Solicitação não encontrada' },
                { status: 404 }
            );
        }

        const updateData: { status?: string; assignedToId?: string | null } = {};
        if (body.status !== undefined) updateData.status = body.status;
        if (body.assignedToId !== undefined) {
            updateData.assignedToId = body.assignedToId || null;
        }

        const updated = await serviceRequestRepository.update(id, updateData);
        return NextResponse.json(updated);
    } catch (error: unknown) {
        console.error('Update service request error:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar solicitação' },
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
        await serviceRequestRepository.delete(id);
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Delete service request error:', error);
        return NextResponse.json(
            { error: 'Erro ao eliminar solicitação' },
            { status: 500 }
        );
    }
}
