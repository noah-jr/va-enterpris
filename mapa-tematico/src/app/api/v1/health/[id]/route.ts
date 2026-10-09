import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET single hospital
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const hospital = await prisma.hospital.findUnique({ where: { id } });
        if (!hospital) return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
        return NextResponse.json({ status: 'success', data: hospital });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT update hospital
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const hospital = await prisma.hospital.update({
            where: { id },
            data: {
                name: body.name,
                type: body.type,
                lat: parseFloat(body.lat),
                lng: parseFloat(body.lng),
                bedCapacity: parseInt(body.bedCapacity),
                currentPatients: parseInt(body.currentPatients),
                province: body.province,
                municipality: body.municipality,
                commune: body.commune,
                commonDiseases: body.commonDiseases
            }
        });
        return NextResponse.json({ status: 'success', data: hospital });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE hospital
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.hospital.delete({ where: { id } });
        return NextResponse.json({ status: 'success', message: 'Hospital unit removed from MTNI grid' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
