import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const contactSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    subject: z.string().min(2, "Assunto muito curto"),
    message: z.string().min(2, "Mensagem muito curta"),
    phone: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = contactSchema.parse(body);

        // 1. Salvar contato no banco de dados
        const contact = await prisma.contact.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                subject: validatedData.subject,
                message: validatedData.message,
                phone: validatedData.phone,
                status: 'NEW', // Novo contato
            },
        });

        // Sync with Internauta
        const nameParts = validatedData.name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Contacto";

        const existingInternauta = await prisma.internauta.findUnique({
            where: { email: validatedData.email },
        });

        if (existingInternauta) {
            await prisma.internauta.update({
                where: { email: validatedData.email },
                data: {
                    phone: validatedData.phone || existingInternauta.phone,
                    status: "ACTIVE",
                },
            });
        } else {
            await prisma.internauta.create({
                data: {
                    email: validatedData.email,
                    firstName,
                    lastName,
                    phone: validatedData.phone,
                    status: "ACTIVE",
                    howDidYouHear: "Formulário de Contacto",
                    notes: `Assunto: ${validatedData.subject}`,
                },
            });
        }

        // 2. Criar notificação
        await prisma.notification.create({
            data: {
                type: 'info',
                title: 'Novo Contato Recebido',
                message: `Nova mensagem de ${validatedData.name}: ${validatedData.subject}`,
                read: false,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Mensagem enviada com sucesso!',
            data: contact
        }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                message: 'Dados inválidos',
                errors: error.issues
            }, { status: 400 });
        }

        console.error('Erro ao processar contato:', error);
        return NextResponse.json({
            success: false,
            message: 'Erro interno ao enviar mensagem'
        }, { status: 500 });
    }
}
