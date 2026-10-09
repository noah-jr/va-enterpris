import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession as auth } from '@/lib/jwt';

export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const contact = await prisma.contact.update({
            where: { id: params.id },
            data: { status: 'READ' },
        });

        return NextResponse.json(contact);
    } catch (error) {
        console.error('Error marking message as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark message as read' },
            { status: 500 }
        );
    }
}
