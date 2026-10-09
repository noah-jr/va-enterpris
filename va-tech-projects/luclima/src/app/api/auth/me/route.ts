import { NextRequest, NextResponse } from 'next/server';
import { AuthUseCases } from '@/application/use-cases/auth.use-cases';
import { userRepository } from '@/infrastructure/repositories';

const authUseCases = new AuthUseCases(userRepository);

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Token não fornecido' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const user = await authUseCases.getCurrentUser(token);

        return NextResponse.json({ user }, { status: 200 });
    } catch (error: any) {
        console.error('Get current user error:', error);
        return NextResponse.json(
            { error: error.message || 'Erro ao obter utilizador' },
            { status: 401 }
        );
    }
}
