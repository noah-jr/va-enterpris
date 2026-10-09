import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession as auth } from '@/lib/jwt';

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const count = await prisma.contact.count({
            where: { status: 'NEW' },
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error counting messages:', error);
        return NextResponse.json(
            { error: 'Failed to count messages' },
            { status: 500 }
        );
    }
}
