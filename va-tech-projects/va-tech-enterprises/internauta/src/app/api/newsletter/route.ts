import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const newsletterSchema = z.object({
    email: z.string().email("Por favor, insira um email válido"),
});

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        const result = newsletterSchema.safeParse({ email });

        if (!result.success) {
            return NextResponse.json({
                success: false,
                message: result.error.issues[0].message
            }, { status: 400 });
        }

        // Verificar se o email já existe
        const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email },
        });

        if (existingSubscriber) {
            return NextResponse.json({
                success: false,
                message: 'Você já está inscrito em nossa newsletter!'
            }, { status: 409 });
        }

        // Salvar no banco
        const subscriber = await prisma.newsletterSubscriber.create({
            data: {
                email,
                active: true,
            },
        });

        // Sync with Internauta
        const existingInternauta = await prisma.internauta.findUnique({
            where: { email },
        });

        if (existingInternauta) {
            await prisma.internauta.update({
                where: { email },
                data: { newsletter: true },
            });
        } else {
            await prisma.internauta.create({
                data: {
                    email,
                    firstName: "Internauta", // Placeholder
                    lastName: "Newsletter", // Placeholder
                    newsletter: true,
                    status: "ACTIVE",
                    howDidYouHear: "Inscrição Newsletter",
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Inscrição realizada com sucesso! Obrigado.'
        }, { status: 201 });

    } catch (error) {
        console.error('Erro ao assinar newsletter:', error);
        return NextResponse.json({
            success: false,
            message: 'Erro interno ao processar inscrição'
        }, { status: 500 });
    }
}

