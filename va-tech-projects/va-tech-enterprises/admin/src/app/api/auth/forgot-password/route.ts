
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
        }

        const internauta = await prisma.internauta.findUnique({
            where: { email },
        });

        if (!internauta) {
            // Return success even if email not found to prevent enumeration
            return NextResponse.json({ success: true, message: "Se o email existir, enviamos um link de recuperação." });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await prisma.internauta.update({
            where: { id: internauta.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/reset-password?token=${resetToken}`;

        await sendEmail(
            email,
            "Recuperação de Palavra-passe - VA Tech",
            `
            <h1>Recuperação de Palavra-passe</h1>
            <p>Recebemos um pedido para alterar a sua palavra-passe.</p>
            <p>Clique no link abaixo para prosseguir:</p>
            <a href="${resetUrl}">Redefinir Palavra-passe</a>
            <p>Se não pediu esta alteração, ignore este email.</p>
            `
        );

        return NextResponse.json({ success: true, message: "Email enviado com suceeso." });

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Erro ao processar pedido" }, { status: 500 });
    }
}
