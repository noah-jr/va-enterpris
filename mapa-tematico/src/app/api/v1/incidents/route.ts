import { NextResponse } from 'next/server';
import { PrismaIncidentRepository } from '@/infrastructure/db/repositories/ModelRepositories';

const incidentRepo = new PrismaIncidentRepository();

export async function GET() {
    try {
        const incidents = await incidentRepo.findAll({
            include: { reporter: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });

        const totalActive = incidents.filter(i => i.status === 'ATIVO').length;
        const totalHighPriority = incidents.filter(i => i.priority === 'ALTA' || i.priority === 'CRITICA').length;
        
        const byType: Record<string, number> = {};
        incidents.forEach(i => {
            byType[i.type] = (byType[i.type] || 0) + 1;
        });

        return NextResponse.json({
            message: 'Incidents retrieved successfully',
            statusCode: 200,
            object: {
                totalActive,
                totalHighPriority,
                byType,
                incidents
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const newIncident = await incidentRepo.create(data);
        return NextResponse.json({
            message: 'Incidente registado',
            statusCode: 201,
            object: newIncident
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
