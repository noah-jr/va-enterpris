import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.contact.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting contact:", error);
        return NextResponse.json(
            { error: "Failed to delete contact" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const contact = await prisma.contact.update({
            where: { id },
            data: {
                status: body.status,
            },
        });

        return NextResponse.json(contact);
    } catch (error) {
        console.error("Error updating contact:", error);
        return NextResponse.json(
            { error: "Failed to update contact" },
            { status: 500 }
        );
    }
}
