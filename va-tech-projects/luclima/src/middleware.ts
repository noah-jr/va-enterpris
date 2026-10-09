import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SECTOR_MANAGER', 'EDITOR'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (!pathname.startsWith('/admin')) {
        return NextResponse.next();
    }

    // Allow admin login page
    if (pathname === '/login') {
        return NextResponse.next();
    }

    const token = request.cookies.get('auth-token')?.value;
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(secret)
        );
        const role = payload.role as string | undefined;
        if (!role || !ADMIN_ROLES.includes(role)) {
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
        return NextResponse.next();
    } catch {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        const res = NextResponse.redirect(loginUrl);
        res.cookies.delete('auth-token');
        return res;
    }
}

export const config = {
    matcher: ['/admin/:path*'],
};
