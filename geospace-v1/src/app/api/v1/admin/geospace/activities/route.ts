import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const [incidents, trips, logs] = await Promise.all([
            prisma.incident.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
            prisma.trip.findMany({ take: 5, orderBy: { startTime: 'desc' } }),
            prisma.auditLog.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
        ]);

        const activities: any[] = [
            ...incidents.map(inc => ({
                id: inc.id,
                type: 'EMERGENCY',
                title: inc.title,
                description: `Ocorrência em ${inc.location}`,
                timestamp: inc.createdAt.toISOString(),
                severity: inc.priority
            })),
            ...trips.map(trip => ({
                id: trip.id,
                type: 'TRIP',
                title: `Corrida: ${trip.driverName}`,
                description: `De ${trip.origin} para ${trip.destination}`,
                timestamp: trip.startTime.toISOString()
            })),
            ...logs.map(log => ({
                id: log.id,
                type: 'SYSTEM',
                title: `Ação: ${log.action}`,
                description: `${log.userName || 'Sistema'} alterou ${log.resource}`,
                timestamp: log.createdAt.toISOString()
            }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

        return NextResponse.json({
            message: 'Atividades multimodais recuperadas',
            statusCode: 200,
            object: activities
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
