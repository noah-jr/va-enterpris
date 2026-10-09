import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const sectors = await prisma.sector.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { users: true }
                }
            }
        });
        return NextResponse.json(sectors);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch sectors" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const sector = await prisma.sector.create({
            data: {
                name: body.name,
                description: body.description,
                icon: body.icon,
                active: body.active ?? true,
            }
        });
        return NextResponse.json(sector);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create sector" }, { status: 500 });
    }
}
