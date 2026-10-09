import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET single demographic entry
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const demo = await prisma.demographicData.findUnique({ where: { id } });
        if (!demo) return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        return NextResponse.json({ status: 'success', data: demo });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT update demographic entry
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const demo = await prisma.demographicData.update({
            where: { id },
            data: {
                regionName: body.regionName,
                regionType: body.regionType,
                totalPopulation: parseInt(body.totalPopulation),
                density: parseFloat(body.density),
                growthRate: parseFloat(body.growthRate),
                agePyramid: body.agePyramid,
                birthRate: parseFloat(body.birthRate),
                lat: parseFloat(body.lat),
                lng: parseFloat(body.lng),
                province: body.province,
                municipality: body.municipality
            }
        });
        return NextResponse.json({ status: 'success', data: demo });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE demographic entry
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.demographicData.delete({ where: { id } });
        return NextResponse.json({ status: 'success', message: 'Demographic record removed from MTNI' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
