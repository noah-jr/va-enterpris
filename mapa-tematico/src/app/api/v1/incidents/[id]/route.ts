import { NextResponse } from 'next/server';
import { PrismaIncidentRepository } from '@/infrastructure/db/repositories/ModelRepositories';

const incidentRepo = new PrismaIncidentRepository();

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const incident = await incidentRepo.findById(id, {
            include: { reporter: { select: { name: true } } }
        });
        
        if (!incident) {
            return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
        }
        
        return NextResponse.json({
            status: 'success',
            object: incident
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await req.json();
        
        const updatedIncident = await incidentRepo.update(id, data);
        
        return NextResponse.json({
            status: 'success',
            message: 'Incidente atualizado',
            object: updatedIncident
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    return PATCH(req, { params });
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await incidentRepo.delete(id);
        
        return NextResponse.json({
            status: 'success',
            message: 'Incidente removido'
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
