import { getSession } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();
    if (!session?.user) {
        return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user: session.user });
}
