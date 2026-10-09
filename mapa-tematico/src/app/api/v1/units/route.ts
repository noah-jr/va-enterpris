import { NextResponse } from "next/server";

// Adicionar isto force-dynamic para evitar caching
export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json([]);
}

export async function POST() {
    return NextResponse.json(
        { error: "Unit creation no longer supported" },
        { status: 410 }
    );
}
