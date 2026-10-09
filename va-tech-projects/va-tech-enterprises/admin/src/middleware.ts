import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';
import { hasPermission } from './lib/permissions';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Allow public assets and API routes (APIs handle their own auth)
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/public') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') // Allow all files with extensions (assets)
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get('auth_token')?.value;
    const isLoginPage = pathname === '/login';

    // 2. Not logged in
    if (!token) {
        if (!isLoginPage) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    // 3. Token exists, verify it
    const payload = await verifyToken(token);

    if (!payload) {
        // Invalid or expired token
        if (!isLoginPage) {
            const response = NextResponse.redirect(new URL('/login?error=SessionExpired', request.url));
            response.cookies.delete('auth_token');
            return response;
        }
        return NextResponse.next();
    }

    // 4. Logged in and trying to access login page
    if (isLoginPage && payload) {
        if (request.nextUrl.searchParams.get('error') === 'SessionExpired') {
            const response = NextResponse.next();
            response.cookies.delete('auth_token');
            return response;
        }
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 5. Check Permissions
    // Only apply permission checks to non-auth pages
    if (!isLoginPage) {
        const userRole = payload.role as string;
        if (!hasPermission(userRole, pathname)) {
            console.warn(`Access denied for role ${userRole} to path ${pathname}`);

            // If the user doesn't have permission for the root path either,
            // or if the current path is already root, redirect to login/logout to prevent loop
            if (pathname === '/' || !hasPermission(userRole, '/')) {
                const response = NextResponse.redirect(new URL('/login?error=Unauthorized', request.url));
                response.cookies.delete('auth_token'); // Force logout if they can't access root
                return response;
            }

            // Redirect to dashboard with error or showing unauthorized
            return NextResponse.redirect(new URL('/?error=Unauthorized', request.url));
        }
    }

    // Update session (no longer needed as cookie extension is handled by client activity or valid token)
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
