import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const total = await prisma.incident.count();
        const active = await prisma.incident.count({ where: { status: 'ATIVO' } });
        const inProgress = await prisma.incident.count({ where: { status: 'EM_PROGRESSO' } });

        return NextResponse.json({
            message: 'Estatísticas de emergência',
            statusCode: 200,
            object: {
                total,
                active,
                resolved: total - active - inProgress,
                cancelled: 0,
                byPriority: {
                    HIGH: await prisma.incident.count({ where: { priority: 'ALTA' } }),
                    MEDIUM: await prisma.incident.count({ where: { priority: 'MEDIA' } }),
                    LOW: await prisma.incident.count({ where: { priority: 'BAIXA' } }),
                    CRITICAL: 0
                },
                averageResponseTime: 42
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
