import { NextRequest, NextResponse } from 'next/server';
import { newsletterRepository } from '@/infrastructure/repositories';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const email = body.email?.trim();

        if (!email) {
            return NextResponse.json(
                { error: 'Email é obrigatório' },
                { status: 400 }
            );
        }

        const subscriber = await newsletterRepository.findByEmail(email);
        if (!subscriber) {
            return NextResponse.json(
                { message: 'Este email não está subscrito.' },
                { status: 200 }
            );
        }

        await newsletterRepository.update(subscriber.id, false);

        return NextResponse.json(
            { message: 'Subscrição cancelada com sucesso.' },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Unsubscribe error:', error);
        return NextResponse.json(
            { error: 'Erro ao cancelar subscrição' },
            { status: 500 }
        );
    }
}
