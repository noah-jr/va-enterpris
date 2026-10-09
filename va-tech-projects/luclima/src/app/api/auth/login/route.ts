import { NextRequest, NextResponse } from 'next/server';
import { AuthUseCases } from '@/application/use-cases/auth.use-cases';
import { userRepository } from '@/infrastructure/repositories';

const authUseCases = new AuthUseCases(userRepository);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email e password são obrigatórios' },
                { status: 400 }
            );
        }

        const result = await authUseCases.login({ email, password });

        const res = NextResponse.json(result, { status: 200 });
        const isProd = process.env.NODE_ENV === 'production';
        res.cookies.set('auth-token', result.token, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });
        return res;
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao fazer login' },
            { status: 401 }
        );
    }
}
