import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const points = await prisma.densityPoint.findMany({
            orderBy: { densityValue: 'desc' }
        });
        return NextResponse.json({
            message: 'Zonas de densidade recuperadas',
            statusCode: 200,
            object: points
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
