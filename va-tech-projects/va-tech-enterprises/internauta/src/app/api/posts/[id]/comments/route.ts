import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/jwt';
import { z } from 'zod';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getSession();

        if (!session || session.user.role !== 'INTERNAUTA') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { content } = z.object({ content: z.string().min(1) }).parse(body);

        const comment = await prisma.comment.create({
            data: {
                content,
                postId: id,
                internautaId: session.user.id,
            },
            include: {
                internauta: {
                    select: {
                        firstName: true,
                        lastName: true,
                        image: true
                    }
                }
            }
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
