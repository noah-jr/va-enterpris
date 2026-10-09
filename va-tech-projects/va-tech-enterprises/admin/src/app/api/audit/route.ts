import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "50");
        const page = parseInt(searchParams.get("page") || "1");
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                orderBy: { createdAt: "desc" },
                take: limit,
                skip,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        }
                    }
                }
            }),
            prisma.auditLog.count()
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Failed to fetch audit logs", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
