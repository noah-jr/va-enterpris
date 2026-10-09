import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Utilizador não encontrado no sistema GEOSPACE.' },
                { status: 404 }
            );
        }

        // Em um sistema real, aqui enviaríamos um email com um token JWT
        // Por agora retornamos sucesso simulando o envio
        return NextResponse.json({
            message: 'Instruções de recuperação enviadas para o email associado.',
            statusCode: 200,
            object: {
                sent: true,
                email: user.email
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
