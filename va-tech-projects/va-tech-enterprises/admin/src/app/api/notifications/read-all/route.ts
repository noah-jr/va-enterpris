import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession as auth } from '@/lib/jwt';

export async function PATCH() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await prisma.notification.updateMany({
            where: { read: false },
            data: { read: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking all as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark all as read' },
            { status: 500 }
        );
    }
}
