
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
        }

        const internauta = await prisma.internauta.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });

        if (!internauta) {
            return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.internauta.update({
            where: { id: internauta.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        return NextResponse.json({ success: true, message: "Senha atualizada" });

    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Erro ao redefinir senha" }, { status: 500 });
    }
}
