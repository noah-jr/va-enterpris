import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/jwt';

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

        const internautaId = session.user.id;

        const existingLike = await prisma.postLike.findUnique({
            where: {
                postId_internautaId: {
                    postId: id,
                    internautaId: internautaId,
                },
            },
        });

        if (existingLike) {
            await prisma.postLike.delete({
                where: { id: existingLike.id },
            });
            return NextResponse.json({ isLiked: false });
        } else {
            await prisma.postLike.create({
                data: {
                    postId: id,
                    internautaId: internautaId,
                },
            });
            return NextResponse.json({ isLiked: true });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
