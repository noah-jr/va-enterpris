import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const team = await prisma.teamMember.findMany({
            orderBy: { order: "asc" },
        });
        return NextResponse.json(team);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching team" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const member = await prisma.teamMember.create({
            data: {
                name: body.name,
                role: body.role,
                image: body.image,
                bio: body.bio,
                linkedin: body.linkedin,
                email: body.email,
                order: body.order || 0,
                active: body.active ?? true,
            },
        });
        return NextResponse.json(member);
    } catch (error) {
        console.error("Team POST error:", error);
        return NextResponse.json({ error: "Error creating member" }, { status: 500 });
    }
}
