import { NextResponse } from "next/server";
import { generateContractPDF, generateInvoicePDF } from "@/lib/pdf";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const documents = await prisma.document.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(documents);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, email, clientName, service, amount, items } = body;

        let pdfBuffer: Buffer;
        let subject: string;
        let filename: string;
        let totalAmount = 0;

        if (type === 'contract') {
            if (!clientName || !service || !amount) {
                return NextResponse.json({ error: "Missing fields for contract" }, { status: 400 });
            }
            pdfBuffer = generateContractPDF(clientName, service, Number(amount));
            subject = `Contrato de Prestação de Serviços - ${service}`;
            filename = 'contrato.pdf';
            totalAmount = Number(amount);
        } else if (type === 'invoice') {
            if (!clientName || !items || !Array.isArray(items)) {
                return NextResponse.json({ error: "Missing fields for invoice" }, { status: 400 });
            }
            pdfBuffer = generateInvoicePDF(clientName, items);
            subject = `Fatura - ${clientName}`;
            filename = 'fatura.pdf';
            totalAmount = items.reduce((acc: number, item: any) => acc + (item.qty * item.price), 0);
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        // Save to Database
        await prisma.document.create({
            data: {
                type: type.toUpperCase(),
                clientName,
                clientEmail: email,
                amount: totalAmount,
                status: "GENERATED",
                data: JSON.stringify(body)
            }
        });

        // Email sending logic
        if (process.env.SMTP_USER && process.env.SMTP_PASS && email) {
            try {
                let transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || "smtp.gmail.com",
                    port: Number(process.env.SMTP_PORT) || 587,
                    secure: false,
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });

                await transporter.sendMail({
                    from: process.env.SMTP_FROM || '"VA Tech" <noreply@vatech.com>',
                    to: email,
                    subject: subject,
                    text: `Olá ${clientName},\n\nSegue em anexo o documento solicitado.\n\nAtenciosamente,\nEquipa VA Tech.`,
                    attachments: [
                        {
                            filename: filename,
                            content: pdfBuffer
                        }
                    ]
                });
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
            }
        }

        // Return the PDF in base64 so user can download it immediately if needed
        return NextResponse.json({
            success: true,
            message: "Documento gerado e salvo com sucesso.",
            pdfBase64: pdfBuffer.toString('base64')
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
