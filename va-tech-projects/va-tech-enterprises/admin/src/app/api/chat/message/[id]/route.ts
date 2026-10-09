import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
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

        // Check ownership
        const message = await prisma.chatMessage.findUnique({
            where: { id }
        });

        if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

        if (message.senderId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.chatMessage.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete message error:", error);
        return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        let userId = session.user.id || (session.user as any).sub;
        if (!userId && session.user.email) {
            const user = await prisma.user.findUnique({ where: { email: session.user.email } });
            if (user) userId = user.id;
        }
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const { content } = await req.json();

        const message = await prisma.chatMessage.findUnique({ where: { id } });
        if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });
        if (message.senderId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const updatedMessage = await prisma.chatMessage.update({
            where: { id },
            data: { content }
        });

        return NextResponse.json(updatedMessage);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
    }
}
