import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const testimonials = await prisma.testimonial.findMany({
            where: { active: true },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(testimonials);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching testimonials" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const testimonial = await prisma.testimonial.create({
            data: {
                name: body.name,
                role: body.role,
                company: body.company,
                content: body.content,
                image: body.image,
                rating: body.rating || 5,
                active: body.active ?? true,
            },
        });
        return NextResponse.json(testimonial);
    } catch (error) {
        console.error("Testimonial POST error:", error);
        return NextResponse.json({ error: "Error creating testimonial" }, { status: 500 });
    }
}
