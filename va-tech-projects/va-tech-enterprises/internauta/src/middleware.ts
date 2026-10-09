import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, updateSession } from './lib/jwt';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('auth_token')?.value;

    const isLoginPage = pathname === '/login-internauta';
    const isInternautaPage = pathname.startsWith('/internauta');

    if (isLoginPage) {
        if (token) {
            const payload = await verifyToken(token);
            if (payload && payload.role === 'INTERNAUTA') {
                return NextResponse.redirect(new URL('/internauta/dashboard', request.url));
            }
        }
        return NextResponse.next();
    }

    if (isInternautaPage) {
        if (pathname.includes('/login') || pathname.includes('/register')) return NextResponse.next();

        if (!token) return NextResponse.redirect(new URL('/login-internauta', request.url));
        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'INTERNAUTA') {
            return NextResponse.redirect(new URL('/login-internauta', request.url));
        }
        return await updateSession(request) || NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/internauta/:path*', '/login-internauta'],
};
