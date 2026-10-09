import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const testimonial = await prisma.testimonial.findUnique({
            where: { id },
        });

        if (!testimonial) {
            return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
        }

        return NextResponse.json(testimonial);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching testimonial" }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const testimonial = await prisma.testimonial.update({
            where: { id },
            data: {
                name: body.name,
                role: body.role,
                company: body.company,
                content: body.content,
                image: body.image,
                rating: body.rating,
                active: body.active,
            },
        });

        return NextResponse.json(testimonial);
    } catch (error) {
        return NextResponse.json({ error: "Error updating testimonial" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.testimonial.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Error deleting testimonial" }, { status: 500 });
    }
}
