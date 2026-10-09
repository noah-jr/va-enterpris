import { NextResponse } from "next/server";
import { generateAndSendOTP } from "@/lib/otp";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email obrigatório" }, { status: 400 });
        }

        await generateAndSendOTP(email);

        return NextResponse.json({ success: true, message: "OTP enviado com sucesso." });
    } catch (error: any) {
        console.error("OTP Error:", error);
        return NextResponse.json({ error: error.message || "Erro ao enviar OTP" }, { status: 500 });
    }
}
