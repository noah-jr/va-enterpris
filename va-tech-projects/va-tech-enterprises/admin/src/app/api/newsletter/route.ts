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

        // Notificar admin
        await prisma.notification.create({
            data: {
                type: 'success',
                title: 'Nova Inscrição na Newsletter',
                message: `Novo assinante: ${email}`,
                link: '/admin/newsletter',
                read: false,
            },
        });

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

export async function GET() {
    try {
        const subscribers = await prisma.newsletterSubscriber.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(subscribers);
    } catch (error) {
        console.error('Erro ao listar subscritores:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
