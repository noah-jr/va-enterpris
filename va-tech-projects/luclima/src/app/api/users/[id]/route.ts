import { NextRequest, NextResponse } from 'next/server';
import { UserUseCases } from '@/application/use-cases/user.use-cases';
import { userRepository } from '@/infrastructure/repositories';

const userUseCases = new UserUseCases(userRepository);

function sanitizeUser(user: Record<string, unknown>): Record<string, unknown> {
    const { password: _, ...rest } = user;
    return rest;
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await userUseCases.getUserById(id);

        if (!user) {
            return NextResponse.json(
                { error: 'Utilizador não encontrado' },
                { status: 404 }
            );
        }

        const safe = sanitizeUser(user as unknown as Record<string, unknown>);
        return NextResponse.json(safe);
    } catch (error: unknown) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Erro ao obter utilizador' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const user = await userUseCases.getUserById(id);
        if (!user) {
            return NextResponse.json(
                { error: 'Utilizador não encontrado' },
                { status: 404 }
            );
        }

        const updateData: { name?: string; email?: string; password?: string; role?: string; sectorId?: string; isActive?: boolean; avatar?: string } = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.email !== undefined) updateData.email = body.email;
        if (body.password !== undefined && body.password !== '') updateData.password = body.password;
        if (body.role !== undefined) updateData.role = body.role;
        if (body.sectorId !== undefined) updateData.sectorId = body.sectorId;
        if (body.isActive !== undefined) updateData.isActive = body.isActive;
        if (body.avatar !== undefined) updateData.avatar = body.avatar;

        const updated = await userUseCases.updateUser(id, updateData);
        const safe = sanitizeUser(updated as unknown as Record<string, unknown>);
        return NextResponse.json(safe);
    } catch (error: unknown) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao atualizar utilizador' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const user = await userUseCases.getUserById(id);
        if (!user) {
            return NextResponse.json(
                { error: 'Utilizador não encontrado' },
                { status: 404 }
            );
        }

        await userUseCases.deleteUser(id);
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { error: 'Erro ao eliminar utilizador' },
            { status: 500 }
        );
    }
}
