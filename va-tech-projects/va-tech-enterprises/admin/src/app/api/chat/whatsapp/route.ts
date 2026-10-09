import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
    try {
        const configs = await prisma.whatsAppConfig.findMany({
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(configs);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch configs" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const config = await prisma.whatsAppConfig.create({
            data: {
                phoneNumber: body.phoneNumber,
                sector: body.sector,
                botName: body.botName,
                isActive: body.isActive ?? true,
            }
        });

        await logAudit({
            action: "CREATE",
            entity: "WhatsAppConfig",
            entityId: config.id,
            details: { sector: config.sector },
            userId: session.user.id
        });

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create config" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        if (!body.id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        const config = await prisma.whatsAppConfig.update({
            where: { id: body.id },
            data: {
                phoneNumber: body.phoneNumber,
                sector: body.sector,
                botName: body.botName,
                isActive: body.isActive,
            }
        });

        await logAudit({
            action: "UPDATE",
            entity: "WhatsAppConfig",
            entityId: config.id,
            details: { sector: config.sector },
            userId: session.user.id
        });

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        await prisma.whatsAppConfig.delete({ where: { id } });

        await logAudit({
            action: "DELETE",
            entity: "WhatsAppConfig",
            entityId: id,
            userId: session.user.id
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete config" }, { status: 500 });
    }
}
