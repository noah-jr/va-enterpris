import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession as auth } from '@/lib/jwt';

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const contacts = await prisma.contact.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true,
                name: true,
                email: true,
                subject: true,
                message: true,
                status: true,
                createdAt: true,
            },
        });

        // Transform to message format
        const messages = contacts.map((contact) => ({
            id: contact.id,
            senderName: contact.name,
            senderEmail: contact.email,
            subject: contact.subject || 'Sem assunto',
            preview: contact.message.substring(0, 100) + (contact.message.length > 100 ? '...' : ''),
            read: contact.status !== 'NEW',
            createdAt: contact.createdAt,
        }));

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching recent messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}
