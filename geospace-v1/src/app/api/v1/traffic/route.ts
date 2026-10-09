import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const trafficData = await prisma.trafficUpdate.findMany({
            orderBy: { updatedAt: 'desc' },
            take: 20
        });

        // Map to include road info if needed
        // Since sqlite doesn't support complex relations easily in this setup without migrations or if missing, 
        // we'll just return the data with some basic mapped fields for the UI
        
        return NextResponse.json({
            message: 'Tráfego recuperado',
            statusCode: 200,
            data: trafficData.map(t => ({
                id: t.id,
                route: `VIA-${t.roadId}`, // Fallback if no joined name
                status: t.status,
                speed: t.avgSpeed,
                maxSpeed: 80, // Realistic default
                vehicles: t.vehicles,
                delay: t.delay || '0 min',
                cause: 'Volume elevado',
                updated: 'Agora'
            }))
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
