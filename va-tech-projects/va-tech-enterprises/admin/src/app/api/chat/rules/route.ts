import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
    try {
        const rules = await prisma.botRule.findMany({
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(rules);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const rule = await prisma.botRule.create({
            data: {
                trigger: body.trigger,
                response: body.response,
                sector: body.sector,
                active: body.active ?? true,
            }
        });

        await logAudit({
            action: "CREATE",
            entity: "BotRule",
            entityId: rule.id,
            details: { trigger: rule.trigger },
            userId: session.user.id
        });

        return NextResponse.json(rule);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create rule" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        if (!body.id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        const rule = await prisma.botRule.update({
            where: { id: body.id },
            data: {
                trigger: body.trigger,
                response: body.response,
                sector: body.sector,
                active: body.active,
            }
        });

        await logAudit({
            action: "UPDATE",
            entity: "BotRule",
            entityId: rule.id,
            details: { trigger: rule.trigger },
            userId: session.user.id
        });

        return NextResponse.json(rule);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update rule" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        await prisma.botRule.delete({ where: { id } });

        await logAudit({
            action: "DELETE",
            entity: "BotRule",
            entityId: id,
            userId: session.user.id
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 });
    }
}
