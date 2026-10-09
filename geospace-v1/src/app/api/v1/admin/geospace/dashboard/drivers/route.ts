import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dados de motoristas (unidades móveis) simulados para a malha Angola
export async function GET() {
    try {
        // Na vida real, buscaríamos de uma tabela de rastreamento em tempo real
        // Para este MVP, retornamos as unidades de terreno que têm agentes
        const units = await prisma.unit.findMany({
            where: { agentsCount: { gt: 0 } }
        });

        const drivers = units.map(u => ({
            id: u.id,
            name: `Patrulha ${u.code}`,
            status: u.status === 'OPERACIONAL' ? 'ONLINE' : 'OFFLINE',
            lat: u.lat + (Math.random() - 0.5) * 0.01, // Posição levemente deslocada para simular movimento
            lng: u.lng + (Math.random() - 0.5) * 0.01,
            lastUpdate: new Date().toISOString()
        }));

        return NextResponse.json({
            message: 'Motoristas online recuperados',
            statusCode: 200,
            object: drivers
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
