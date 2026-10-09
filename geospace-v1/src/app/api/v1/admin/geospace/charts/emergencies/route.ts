import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Fetch incidents from last 24h
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const incidents = await prisma.incident.findMany({
            where: {
                createdAt: { gte: yesterday }
            },
            select: { createdAt: true }
        });

        // Group by 4h intervals: 00, 04, 08, 12, 16, 20
        const counts = [0, 0, 0, 0, 0, 0];
        incidents.forEach(inc => {
            const hour = inc.createdAt.getHours();
            const index = Math.floor(hour / 4);
            if (index >= 0 && index < 6) {
                counts[index]++;
            }
        });

        return NextResponse.json({
            message: 'Dados do gráfico recuperados',
            statusCode: 200,
            data: {
              data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [
                    {
                        label: 'Operações Ativas',
                        data: counts,
                    }
                ]
              }
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
