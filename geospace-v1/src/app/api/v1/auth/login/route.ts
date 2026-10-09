import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'geospace-military-grade-secret-2026';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { emailOrPhone, password } = body;

        if (!emailOrPhone || !password) {
            return NextResponse.json(
                { message: 'Identificador e chave são obrigatórios' },
                { status: 400 }
            );
        }

        // 1. Buscar utilizador (email ou nome)
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: emailOrPhone },
                    { name: emailOrPhone }
                ]
            }
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Credenciais de acesso inválidas' },
                { status: 401 }
            );
        }

        // 2. Verificar password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Credenciais de acesso inválidas' },
                { status: 401 }
            );
        }

        if (user.status !== 'ACTIVE') {
            return NextResponse.json(
                { message: 'Acesso suspenso. Contacte o centro de comando.' },
                { status: 403 }
            );
        }

        // 3. Gerar JWT Real (Sem mocks)
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
        const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            message: 'Autenticação validada. Acesso concedido.',
            statusCode: 200,
            object: {
                accessToken,
                refreshToken,
                user: {
                    ...userWithoutPassword,
                    permissions: user.permissions ? JSON.parse(user.permissions) : []
                }
            }
        });

    } catch (error: any) {
        console.error('SERVER ERROR (AUTH_LOGIN):', error);
        return NextResponse.json(
            { message: 'Falha crítica no servidor de autenticação' },
            { status: 500 }
        );
    }
}
