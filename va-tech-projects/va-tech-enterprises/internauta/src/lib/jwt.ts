import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'default_secret_key_change_me';
const key = new TextEncoder().encode(secretKey);

export interface User {
    id: string;
    email: string;
    role: string;
    name?: string | null;
    image?: string | null;
    firstName?: string | null;
    lastName?: string | null;
}

export async function signToken(payload: User) {
    return await new SignJWT(payload as any)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function verifyToken(token: string): Promise<User | null> {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload as unknown as User;
    } catch (error) {
        return null;
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    const user = await verifyToken(token);
    if (!user) return null;
    return { user };
}

export async function updateSession(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return;

    // Refresh token expiry if needed, for now just returning
    const parsed = await verifyToken(token);
    if (!parsed) return;

    const res = NextResponse.next();
    res.cookies.set({
        name: 'auth_token',
        value: token,
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return res;
}
