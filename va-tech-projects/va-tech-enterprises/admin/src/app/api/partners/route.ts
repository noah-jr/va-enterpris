import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession as auth } from "@/lib/jwt";

export async function GET() {
    try {
        const partners = await prisma.partner.findMany({
            orderBy: { order: "asc" },
        });

        return NextResponse.json(partners);
    } catch (error) {
        console.error("Error fetching partners:", error);
        return NextResponse.json(
            { error: "Failed to fetch partners" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, logo, link, order, active } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const partner = await prisma.partner.create({
            data: {
                name,
                logo,
                link,
                order: order || 0,
                active: active ?? true,
            },
        });

        return NextResponse.json(partner);
    } catch (error) {
        console.error("Create partner error:", error);
        return NextResponse.json({ error: "Failed to create partner" }, { status: 500 });
    }
}
