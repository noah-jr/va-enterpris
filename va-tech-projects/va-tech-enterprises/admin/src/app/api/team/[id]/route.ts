import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logAudit } from "@/lib/audit";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        const { id } = await params;
        const body = await req.json();
        const member = await prisma.teamMember.update({
            where: { id },
            data: {
                name: body.name,
                role: body.role,
                image: body.image,
                bio: body.bio,
                linkedin: body.linkedin,
                email: body.email,
                active: body.active,
                order: body.order,
            },
        });

        await logAudit({
            action: "UPDATE",
            entity: "TeamMember",
            entityId: member.id,
            details: { name: member.name },
            userId: session?.user?.id
        });

        return NextResponse.json(member);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        const { id } = await params;

        const member = await prisma.teamMember.findUnique({ where: { id } });
        await prisma.teamMember.delete({ where: { id } });

        if (member) {
            await logAudit({
                action: "DELETE",
                entity: "TeamMember",
                entityId: id,
                details: { name: member.name },
                userId: session?.user?.id
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
    }
}
