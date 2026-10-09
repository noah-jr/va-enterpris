import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const incidents = await prisma.incident.findMany({
            include: { reporter: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({
            message: 'Incidentes recuperados',
            statusCode: 200,
            object: incidents
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const newIncident = await prisma.incident.create({ data });
        return NextResponse.json({
            message: 'Incidente registado',
            statusCode: 201,
            object: newIncident
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
