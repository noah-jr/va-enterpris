import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

// Hardcoded admin credentials (in production, use a database)
const ADMIN_CREDENTIALS = {
    email: "admin@vatech.pt",
    password: "admin123", // In production, use hashed passwords
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate credentials
        if (
            email === ADMIN_CREDENTIALS.email &&
            password === ADMIN_CREDENTIALS.password
        ) {
            // Create JWT token
            const token = await new SignJWT({ email, role: "admin" })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime("24h")
                .sign(SECRET_KEY);

            return NextResponse.json(
                {
                    success: true,
                    token,
                    user: {
                        email,
                        role: "admin",
                    },
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { success: false, error: "Credenciais inválidas" },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { success: false, error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
