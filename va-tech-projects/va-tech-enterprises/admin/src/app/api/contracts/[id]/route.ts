import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateContractPDF, generateInvoicePDF } from "@/lib/pdf";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.document.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const document = await prisma.document.update({
            where: { id },
            data: { status: body.status }
        });

        return NextResponse.json(document);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
    }
}

// GET to fetch specific document or regenerate PDF
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const document = await prisma.document.findUnique({ where: { id } });

        if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

        // If 'pdf' param is present, regenerate the PDF
        const url = new URL(req.url);
        if (url.searchParams.get("pdf") === "true") {
            const data = JSON.parse(document.data);
            let pdfBuffer: Buffer;

            if (document.type === 'CONTRACT') {
                pdfBuffer = generateContractPDF(data.clientName, data.service, Number(data.amount));
            } else {
                pdfBuffer = generateInvoicePDF(data.clientName, data.items);
            }

            return NextResponse.json({
                pdfBase64: pdfBuffer.toString('base64')
            });
        }

        return NextResponse.json(document);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
    }
}
