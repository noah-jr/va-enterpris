import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const total = await prisma.user.count();
        const active = await prisma.user.count({ where: { status: 'ACTIVE' } });
        const suspended = await prisma.user.count({ where: { status: 'SUSPENDED' } });
        const banned = await prisma.user.count({ where: { status: 'BANNED' } });

        return NextResponse.json({
            total,
            active,
            suspended,
            banned
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
