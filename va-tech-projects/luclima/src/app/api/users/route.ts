import { NextRequest, NextResponse } from 'next/server';
import { UserUseCases } from '@/application/use-cases/user.use-cases';
import { userRepository } from '@/infrastructure/repositories';

const userUseCases = new UserUseCases(userRepository);

function sanitizeUser(user: Record<string, unknown>): Record<string, unknown> {
    const { password: _, ...rest } = user;
    return rest;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const sectorId = searchParams.get('sectorId');
        const isActive = searchParams.get('isActive');
        const search = searchParams.get('search');

        const filters: { role?: string; sectorId?: string; isActive?: boolean; search?: string } = {};
        if (role) filters.role = role;
        if (sectorId) filters.sectorId = sectorId;
        if (isActive === 'true') filters.isActive = true;
        if (isActive === 'false') filters.isActive = false;
        if (search) filters.search = search;

        const users = await userUseCases.getAllUsers(filters);

        const safeUsers = users.map((u) => sanitizeUser(u as unknown as Record<string, unknown>));

        return NextResponse.json({ users: safeUsers }, { status: 200 });
    } catch (error: unknown) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: 'Erro ao obter utilizadores' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password, role, sectorId } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Nome, email e password são obrigatórios' },
                { status: 400 }
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Email inválido' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password deve ter pelo menos 6 caracteres' },
                { status: 400 }
            );
        }

        const existing = await userUseCases.getUserByEmail(email);
        if (existing) {
            return NextResponse.json(
                { error: 'Já existe um utilizador com este email' },
                { status: 400 }
            );
        }

        const user = await userUseCases.createUser({
            name,
            email,
            password,
            role: role || 'EMPLOYEE',
            sectorId: sectorId || undefined,
        });

        const safe = sanitizeUser(user as unknown as Record<string, unknown>);
        return NextResponse.json(safe, { status: 201 });
    } catch (error: unknown) {
        console.error('Create user error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao criar utilizador' },
            { status: 500 }
        );
    }
}
