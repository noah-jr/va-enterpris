import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET single school
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const school = await prisma.school.findUnique({ where: { id } });
        if (!school) return NextResponse.json({ error: 'School not found' }, { status: 440 });
        return NextResponse.json({ status: 'success', data: school });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT update school
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const school = await prisma.school.update({
            where: { id },
            data: {
                name: body.name,
                level: body.level,
                lat: parseFloat(body.lat),
                lng: parseFloat(body.lng),
                studentsCount: parseInt(body.studentsCount),
                teachersCount: parseInt(body.teachersCount),
                passRate: parseFloat(body.passRate),
                failRate: parseFloat(body.failRate),
                dropoutRate: parseFloat(body.dropoutRate),
                infrastructure: body.infrastructure,
                province: body.province,
                municipality: body.municipality,
                commune: body.commune
            }
        });
        return NextResponse.json({ status: 'success', data: school });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE school
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.school.delete({ where: { id } });
        return NextResponse.json({ status: 'success', message: 'School removed from MTNI' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
