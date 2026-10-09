import { NextRequest, NextResponse } from 'next/server';
import { UserUseCases } from '@/application/use-cases/user.use-cases';
import { userRepository } from '@/infrastructure/repositories';

const userUseCases = new UserUseCases(userRepository);

export async function POST(
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

        const qrCode = await userUseCases.regenerateQRCode(id);
        return NextResponse.json({ qrCode });
    } catch (error: unknown) {
        console.error('Regenerate QR code error:', error);
        return NextResponse.json(
            { error: 'Erro ao regenerar QR Code' },
            { status: 500 }
        );
    }
}
