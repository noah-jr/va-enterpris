import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession as auth } from "@/lib/jwt";

export async function GET() {
    try {
        const partners = await prisma.partner.findMany({
            orderBy: { order: "asc" },
        });

        return NextResponse.json(partners);
    } catch (error) {
        console.error("Error fetching partners:", error);
        return NextResponse.json(
            { error: "Failed to fetch partners" },
            { status: 500 }
        );
    }
}

