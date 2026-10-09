import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

export async function generateAndSendOTP(email: string) {
    // 1. Check if user exists
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new Error("Usuário não encontrado.");
    }

    // 2. Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // 3. Save to DB
    await prisma.user.update({
        where: { email },
        data: {
            otp: otpHash,
            otpExpires: expires
        }
    });

    // 4. Send Email
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"VA Tech Security" <noreply@vatech.com>',
            to: email,
            subject: "O seu código de verificação (OTP)",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Código de Verificação</h2>
                    <p>Utilize o código abaixo para aceder à sua conta:</p>
                    <h1 style="color: #0070f3; letter-spacing: 5px;">${otp}</h1>
                    <p>Este código expira em 15 minutos.</p>
                    <p>Se não solicitou este código, ignore este email.</p>
                </div>
            `
        });
        return true;
    } else {
        console.warn("SMTP not configured. OTP:", otp);
        // For dev purposes, maybe return the OTP? No, bad security.
        return true;
    }
}
