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

