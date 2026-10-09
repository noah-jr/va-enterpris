import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession as auth } from "@/lib/jwt";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const guestId = searchParams.get("guestId");
        const session = await auth();

        const userId = session?.user?.id;

        if (!guestId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const messages = await prisma.chatMessage.findMany({
            where: {
                chat: userId
                    ? { users: { some: { id: userId } } }
                    : { guestId: guestId! }
            },
            orderBy: { createdAt: "asc" },
            take: 50
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error("History API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
