import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Fetch trips from last 24h
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const trips = await prisma.trip.findMany({
            where: {
                startTime: { gte: yesterday }
            },
            select: { startTime: true }
        });

        // Group by 4h intervals: 00, 04, 08, 12, 16, 20
        const counts = [0, 0, 0, 0, 0, 0];
        trips.forEach(trip => {
            const hour = trip.startTime.getHours();
            const index = Math.floor(hour / 4);
            if (index >= 0 && index < 6) {
                counts[index]++;
            }
        });

        return NextResponse.json({
            message: 'Dados do gráfico de corridas recuperados',
            statusCode: 200,
            data: {
              data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [
                    {
                        label: 'Volume de Corridas',
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
