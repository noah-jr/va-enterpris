import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/jwt';
import { z } from 'zod';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getSession();

    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const internauta = await (prisma.internauta as any).findUnique({
            where: { id },
            include: {
                _count: {
                    select: { comments: true, likes: true }
                },
                comments: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    include: {
                        post: {
                            select: { title: true, slug: true }
                        }
                    }
                }
            }
        });

        if (!internauta) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json(internauta);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getSession();

        // Security: only the internauta themselves or an admin can update
        if (!session || (session.user.id !== id && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Dynamic update whitelist
        const updateData: any = {};
        const fields = ['firstName', 'lastName', 'phone', 'city', 'country', 'occupation', 'company', 'interests'];

        for (const field of fields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        const updated = await prisma.internauta.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating internauta:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
