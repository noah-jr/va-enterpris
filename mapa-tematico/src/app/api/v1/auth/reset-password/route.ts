import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        // Em um sistema real, aqui o token seria um JWT com expiração
        // Por agora o token é simulado para fluxo de UI
        if (!token) {
            return NextResponse.json(
                { message: 'Token de recuperação inválido ou expirado.' },
                { status: 400 }
            );
        }

        // Recuperar user pelo email ou algo presente no token decodificado
        // Supondo token = email para o teste simples
        const user = await prisma.user.findUnique({
            where: { email: token } 
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Falha na autorização de redefinição.' },
                { status: 404 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        return NextResponse.json({
            message: 'Sua chave mestra foi redefinida com sucesso.',
            statusCode: 200,
            object: {
                success: true
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
