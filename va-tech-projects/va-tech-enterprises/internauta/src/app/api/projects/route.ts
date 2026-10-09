import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession as auth } from "@/lib/jwt";
import { logAudit } from "@/lib/audit";

export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(projects);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching projects" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        const body = await request.json();
        const project = await prisma.project.create({
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
            },
        });

        await logAudit({
            action: "CREATE",
            entity: "Project",
            entityId: project.id,
            details: { title: project.title },
            userId: session?.user?.id
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error creating project" }, { status: 500 });
    }
}
