import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'geospace-military-grade-secret-2026';

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Token de acesso não fornecido ou inválido' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];

        // 1. Verificação REAL de JWT (Sem mocks)
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err: any) {
            console.error('JWT ERROR:', err.message);
            return NextResponse.json(
                { message: 'Acesso negado: Token expirado ou corrompido' },
                { status: 401 }
            );
        }

        const userId = decoded.id;

        // 2. Buscar user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Perfil não reconhecido pela malha de segurança' },
                { status: 404 }
            );
        }

        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            message: 'Informações de perfil recuperadas com sucesso',
            statusCode: 200,
            object: {
                ...userWithoutPassword,
                permissions: user.permissions ? JSON.parse(user.permissions) : []
            }
        });

    } catch (error: any) {
        console.error('SERVER ERROR (AUTH_PROFILE):', error);
        return NextResponse.json(
            { message: 'Erro ao validar perfil de utilizador' },
            { status: 500 }
        );
    }
}
