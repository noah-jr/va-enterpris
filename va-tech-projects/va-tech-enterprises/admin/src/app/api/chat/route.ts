import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            console.log("No session or email found");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let userId = session.user.id || (session.user as any).sub;

        // If no ID in session, try to find user by email
        if (!userId && session.user.email) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email }
            });
            if (user) {
                userId = user.id;
            }
        }

        if (!userId) {
            console.log("No user ID found for email", session.user.email);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const isAdmin = (session.user as any).role === "ADMIN";

        const chats = await prisma.chat.findMany({
            where: isAdmin ? {} : {
                users: { some: { id: userId } }
            },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                }
            },
            orderBy: { updatedAt: "desc" }
        });

        return NextResponse.json(chats);
    } catch (error) {
        console.error("Chat list error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Start a new chat
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let currentUserId = session.user.id || (session.user as any).sub;

        if (!currentUserId && session.user.email) {
            const user = await prisma.user.findUnique({
                where: { email: session.user.email }
            });
            if (user) {
                currentUserId = user.id;
            }
        }

        if (!currentUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId, title, isGroup } = await req.json();

        // Check if direct chat already exists
        if (!isGroup && userId) {
            const existingChat = await prisma.chat.findFirst({
                where: {
                    isGroup: false,
                    AND: [
                        { users: { some: { id: currentUserId } } },
                        { users: { some: { id: userId } } }
                    ]
                },
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        }
                    },
                    messages: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    }
                }
            });
            if (existingChat) return NextResponse.json(existingChat);
        }

        const chat = await prisma.chat.create({
            data: {
                title,
                isGroup: !!isGroup,
                users: {
                    connect: [
                        { id: currentUserId },
                        ...(userId ? [{ id: userId }] : [])
                    ]
                }
            },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                }
            }
        });

        return NextResponse.json(chat);
    } catch (error) {
        console.error("Create chat error:", error);
        return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
    }
}
