import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
    try {
        const members = await prisma.teamMember.findMany({
            orderBy: { order: "asc" },
        });
        return NextResponse.json(members);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        const body = await req.json();
        const member = await prisma.teamMember.create({
            data: {
                name: body.name,
                role: body.role,
                image: body.image,
                bio: body.bio,
                linkedin: body.linkedin,
                email: body.email,
                active: body.active ?? true,
                order: body.order ?? 0,
            },
        });

        await logAudit({
            action: "CREATE",
            entity: "TeamMember",
            entityId: member.id,
            details: { name: member.name },
            userId: session?.user?.id
        });

        return NextResponse.json(member);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
    }
}
