import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logAudit } from './lib/audit';
import type { User } from '@prisma/client';

async function getUser(email: string): Promise<User | null> {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(1) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;

                    // 1. Check OTP (treat password input as potential OTP)
                    if (user.otp && user.otpExpires && user.otpExpires > new Date()) {
                        const otpMatch = await bcrypt.compare(password, user.otp);
                        if (otpMatch) {
                            // Clear OTP after successful use
                            await prisma.user.update({
                                where: { email },
                                data: { otp: null, otpExpires: null }
                            });
                            return user;
                        }
                    }

                    // 2. Check Password (standard)
                    // DEV MODE: Se a senha no banco for o placeholder do seed
                    if (user.password === "admin_password_hash_placeholder") {
                        if (password === "admin123") return user;
                        // Don't return null yet, check bcrypt below (though unlikely for placeholder)
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return user;
                }

                return null;
            },
        }),
    ],
    events: {
        async signIn({ user }) {
            if (user?.id) {
                await logAudit({
                    action: "LOGIN",
                    entity: "User",
                    entityId: user.id,
                    userId: user.id,
                    details: { email: user.email }
                });
            }
        },
    }
});
