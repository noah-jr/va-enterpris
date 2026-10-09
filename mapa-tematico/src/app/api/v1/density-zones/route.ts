import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const points = await prisma.demographicData.findMany({
            orderBy: { density: 'desc' },
            take: 20
        });
        
        // Map to legacy format if needed, but since we're cleaning up, 
        // let's return it and fix the client if necessary.
        return NextResponse.json({
            message: 'Zonas de densidade (Demografia) recuperadas',
            statusCode: 200,
            object: points.map(p => ({
                id: p.id,
                lat: p.lat,
                lng: p.lng,
                densityValue: p.density,
                label: p.regionName
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
