import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                sectors: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Update user sectors
export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { userId, sectorIds } = await req.json();

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                sectors: {
                    set: sectorIds.map((id: string) => ({ id }))
                }
            },
            include: {
                sectors: true
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update user sectors" }, { status: 500 });
    }
}
