import { NextRequest, NextResponse } from 'next/server';
import { contactRepository } from '@/infrastructure/repositories';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, subject, message } = body;

        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Nome, email, assunto e mensagem são obrigatórios' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Email inválido' },
                { status: 400 }
            );
        }

        const contact = await contactRepository.create({
            name,
            email,
            phone: phone || undefined,
            subject,
            message,
        });

        return NextResponse.json(
            { message: 'Mensagem enviada com sucesso!', contact: { id: contact.id } },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Erro ao enviar mensagem' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const isReplied = searchParams.get('isReplied');

        const filters: { isReplied?: boolean } = {};
        if (isReplied === 'true') filters.isReplied = true;
        if (isReplied === 'false') filters.isReplied = false;

        const contacts = await contactRepository.findAll(filters);

        return NextResponse.json({ contacts }, { status: 200 });
    } catch (error: unknown) {
        console.error('Get contacts error:', error);
        return NextResponse.json(
            { error: 'Erro ao obter contactos' },
            { status: 500 }
        );
    }
}
