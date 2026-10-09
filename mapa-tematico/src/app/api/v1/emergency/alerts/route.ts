import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeia Incidentes para o formato de Emergência esperado pelo EmergencyService
export async function GET() {
    try {
        const incidents = await prisma.incident.findMany({
            orderBy: { createdAt: 'desc' },
            include: { reporter: { select: { name: true } } }
        });

        const emergencies = incidents.map(inc => ({
            id: inc.id,
            userId: inc.reporterId || 'system',
            userType: 'DRIVER',
            latitude: inc.lat,
            longitude: inc.lng,
            type: inc.type,
            status: inc.status === 'ATIVO' ? 'ACTIVE' : (inc.status === 'EM_PROGRESSO' ? 'IN_PROGRESS' : 'RESOLVED'),
            priority: inc.priority === 'ALTA' ? 'HIGH' : (inc.priority === 'MEDIA' ? 'MEDIUM' : 'LOW'),
            description: inc.description,
            createdAt: inc.createdAt.toISOString(),
            user: {
                id: inc.reporterId || 'system',
                name: inc.reporter?.name || 'Agente Externo',
                phone: '+244 923 000 000'
            }
        }));

        return NextResponse.json({
            message: 'Alertas de emergência recuperados',
            statusCode: 200,
            object: emergencies
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
