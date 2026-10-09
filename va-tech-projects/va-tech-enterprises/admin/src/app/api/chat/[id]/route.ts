import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        let userId = session.user.id || (session.user as any).sub;

        if (!userId && session.user.email) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email }
            });
            if (user) userId = user.id;
        }

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const messages = await prisma.chatMessage.findMany({
            where: { chatId: id },
            orderBy: { createdAt: "asc" },
            include: {
                sender: {
                    select: { id: true, name: true, image: true }
                }
            }
        });

        // Mark messages as read
        await prisma.chatMessage.updateMany({
            where: {
                chatId: id,
                receiverId: userId,
                read: false
            },
            data: { read: true }
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error("Fetch messages error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        let userId = session.user.id || (session.user as any).sub;

        if (!userId && session.user.email) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email }
            });
            if (user) userId = user.id;
        }

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const { content, receiverId, attachmentUrl, attachmentType } = await req.json();

        const message = await prisma.chatMessage.create({
            data: {
                content,
                chatId: id,
                senderId: userId,
                receiverId,
                attachmentUrl,
                attachmentType,
            }
        });

        // Update chat updatedAt for ordering
        await prisma.chat.update({
            where: { id },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error("Send message error:", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}
