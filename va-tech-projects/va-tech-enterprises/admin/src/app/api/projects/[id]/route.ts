import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession as auth } from "@/lib/jwt";
import { logAudit } from "@/lib/audit";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching project" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;
        const body = await request.json();

        // Get original project for details if needed, or just log the change
        const project = await prisma.project.update({
            where: { id },
            data: {
                title: body.title,
                slug: body.slug,
                description: body.description,
                content: body.content,
                category: body.category,
                image: body.image,
                client: body.client,
                year: body.year,
                link: body.link,
                featured: body.featured,
                active: body.active,
            },
        });

        await logAudit({
            action: "UPDATE",
            entity: "Project",
            entityId: project.id,
            details: { title: project.title, changes: body }, // Naive change log
            userId: session?.user?.id
        });

        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json({ error: "Error updating project" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        // Find first to get title for log
        const project = await prisma.project.findUnique({ where: { id } });

        await prisma.project.delete({
            where: { id },
        });

        if (project) {
            await logAudit({
                action: "DELETE",
                entity: "Project",
                entityId: id,
                details: { title: project.title },
                userId: session?.user?.id
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Error deleting project" }, { status: 500 });
    }
}
