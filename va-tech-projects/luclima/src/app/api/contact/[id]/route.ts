import { NextRequest, NextResponse } from 'next/server';
import { contactRepository } from '@/infrastructure/repositories';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const contact = await contactRepository.findById(id);

        if (!contact) {
            return NextResponse.json(
                { error: 'Contacto não encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(contact);
    } catch (error: unknown) {
        console.error('Get contact error:', error);
        return NextResponse.json(
            { error: 'Erro ao obter contacto' },
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

        const contact = await contactRepository.findById(id);
        if (!contact) {
            return NextResponse.json(
                { error: 'Contacto não encontrado' },
                { status: 404 }
            );
        }

        const updated = await contactRepository.update(id, {
            isReplied: body.isReplied,
            repliedAt: body.repliedAt ? new Date(body.repliedAt) : undefined,
        });

        return NextResponse.json(updated);
    } catch (error: unknown) {
        console.error('Update contact error:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar contacto' },
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
        await contactRepository.delete(id);
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Delete contact error:', error);
        return NextResponse.json(
            { error: 'Erro ao eliminar contacto' },
            { status: 500 }
        );
    }
}
