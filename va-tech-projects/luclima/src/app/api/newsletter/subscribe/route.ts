import { NextRequest, NextResponse } from 'next/server';
import { newsletterRepository } from '@/infrastructure/repositories';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email é obrigatório' },
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

        // Check if email already exists
        const existing = await newsletterRepository.findByEmail(email);
        if (existing) {
            if (existing.isActive) {
                return NextResponse.json(
                    { error: 'Este email já está subscrito' },
                    { status: 409 }
                );
            } else {
                // Reactivate subscription
                await newsletterRepository.update(existing.id, true);
                return NextResponse.json(
                    { message: 'Subscrição reativada com sucesso!' },
                    { status: 200 }
                );
            }
        }

        // Create new subscription
        await newsletterRepository.create(email);

        return NextResponse.json(
            { message: 'Subscrição realizada com sucesso!' },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { error: 'Erro ao processar subscrição' },
            { status: 500 }
        );
    }
}
