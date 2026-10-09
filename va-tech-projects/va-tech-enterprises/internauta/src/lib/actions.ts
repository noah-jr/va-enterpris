'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function getInternauta(email: string) {
    return await prisma.internauta.findUnique({ where: { email } });
}

export async function logOut() {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    redirect('/');
}

export async function authenticateInternauta(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const rawFormData = Object.fromEntries(formData);
        const parsedCredentials = z
            .object({
                email: z.string().email(),
                password: z.string().min(1),
                captcha: z.string().min(1, "Captcha é obrigatório")
            })
            .safeParse(rawFormData);

        if (!parsedCredentials.success) {
            return 'Formato de email inválido ou senha vazia.';
        }

        const { email, password, captcha } = parsedCredentials.data;

        // Verify reCAPTCHA
        if (!captcha) {
            return 'Por favor, complete o reCAPTCHA.';
        }

        if (process.env.RECAPTCHA_SECRET_KEY) {
            try {
                const recaptchaRes = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captcha}`, {
                    method: 'POST'
                });
                const recaptchaData = await recaptchaRes.json();

                if (!recaptchaData.success) {
                    return 'Falha na verificação do reCAPTCHA. Tente novamente.';
                }
            } catch (err) {
                console.error('Recaptcha verification error:', err);
                // Decide if we want to block or allow on network error. 
                // For devfriendliness, maybe we just log it.
                // But strict security would require blocking. 
                // Given the context is "getting it to work", I'll throw to let the outer catch handle it 
                // OR just return a friendly error. the outer catch returns "Algo correu mal."
                // "fetch failed" in the user request was caught by the outer catch.
                // Let's just let it fall through or rethrow?
                // Actually, if I remove the fallback key, this block won't run for the user.
                throw err;
            }
        } else {
            console.warn('RECAPTCHA_SECRET_KEY not set, skipping verification.');
        }

        const internauta = await getInternauta(email) as any;

        if (!internauta || !internauta.password) {
            return 'Credenciais Inválidas ou conta não configurada.';
        }

        const passwordsMatch = await bcrypt.compare(password, internauta.password);

        if (!passwordsMatch) {
            return 'Credenciais Inválidas.';
        }

        // Generate JWT
        const token = await signToken({
            id: internauta.id,
            email: internauta.email,
            role: 'INTERNAUTA',
            firstName: internauta.firstName,
            lastName: internauta.lastName,
            image: internauta.image,
        });

        // Set Cookie
        const cookieStore = await cookies();
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });

    } catch (error) {
        console.error('Internauta Auth error:', error);
        return 'Algo correu mal.';
    }

    redirect('/internauta/dashboard');
}

export async function registerInternauta(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const rawFormData = Object.fromEntries(formData);
        const parsed = z.object({
            firstName: z.string().min(2),
            lastName: z.string().min(2),
            email: z.string().email(),
            password: z.string().min(6),
        }).safeParse(rawFormData);

        if (!parsed.success) {
            return 'Dados inválidos. A password deve ter pelo menos 6 caracteres.';
        }

        const { firstName, lastName, email, password } = parsed.data;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newsletter = rawFormData.newsletter === 'on';

        const existing = await prisma.internauta.findUnique({ where: { email } }) as any;

        if (existing) {
            if (existing.password) {
                return 'Este email já está registado. Tente fazer login.';
            }
            // If they signed up for newsletter/contact before, they exist but have no password
            await prisma.internauta.update({
                where: { email },
                data: {
                    firstName,
                    lastName,
                    password: hashedPassword,
                    status: 'ACTIVE',
                    newsletter
                } as any
            });
        } else {
            await prisma.internauta.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    status: 'ACTIVE',
                    howDidYouHear: 'Direct Registration',
                    newsletter,
                    termsAccepted: true
                } as any
            });
        }

        // 1. Create Newsletter Subscriber entry to unify data for Marketing
        await prisma.newsletterSubscriber.upsert({
            where: { email },
            update: { active: true },
            create: { email, active: true }
        });

        // 2. Authenticate immediately
        const internauta = await prisma.internauta.findUnique({ where: { email } }) as any;
        if (!internauta) return 'Erro ao recuperar dados do utilizador.';
        const token = await signToken({
            id: internauta.id,
            email: internauta.email,
            role: 'INTERNAUTA',
            firstName: internauta.firstName,
            lastName: internauta.lastName,
            image: internauta.image,
        });

        const cookieStore = await cookies();
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/',
        });

    } catch (error) {
        console.error('Registration error:', error);
        return 'Erro ao criar conta. Tente novamente.';
    }

    redirect('/internauta/dashboard');
}
