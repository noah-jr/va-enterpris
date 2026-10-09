import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const roads = await prisma.road.findMany();
        return NextResponse.json({
            message: 'Malha rodoviária recuperada',
            statusCode: 200,
            object: roads
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
