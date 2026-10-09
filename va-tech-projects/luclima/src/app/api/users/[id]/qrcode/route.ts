import { NextRequest, NextResponse } from 'next/server';
import { UserUseCases } from '@/application/use-cases/user.use-cases';
import { userRepository } from '@/infrastructure/repositories';

const userUseCases = new UserUseCases(userRepository);

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

        const userWithQr = user as { qrCode?: string };
        if (!userWithQr.qrCode) {
            const qrCodeUrl = await userUseCases.regenerateQRCode(id);
            return NextResponse.json({ qrCode: qrCodeUrl });
        }

        return NextResponse.json({ qrCode: userWithQr.qrCode });
    } catch (error: unknown) {
        console.error('Get QR code error:', error);
        return NextResponse.json(
            { error: 'Erro ao obter QR Code' },
            { status: 500 }
        );
    }
}
