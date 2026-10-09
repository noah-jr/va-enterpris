import { NextResponse, NextRequest } from 'next/server';

// Dynamic role list based on the auth service
const AUTHORIZED_ROLES = ['SUPER_ADMIN', 'ADMIN_NACIONAL', 'ADMIN_PROVINCIAL', 'ADMIN_MUNICIPAL', 'ADMIN_DISTRITAL', 'ADMIN_COMUNA', 'OPERADOR'];

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const userRole = request.cookies.get('user_role')?.value;

    const { pathname } = request.nextUrl;

    // 1. Allow access to public assets and auth routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('favicon.ico') ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/forgot-password'
    ) {
        // If already logged in and trying to access login/register, redirect to dashboard
        if (token && userRole && AUTHORIZED_ROLES.includes(userRole)) {
            if (pathname === '/login' || pathname === '/register') {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
        return NextResponse.next();
    }

    // 2. Protect all other routes
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3. Check role requirement
    if (!userRole || !AUTHORIZED_ROLES.includes(userRole)) {
        // Redirect to login if user role is not authorized for THIS admin
        // We might want to show an "Unauthorized" page instead, but login is safer for now
        const response = NextResponse.redirect(new URL('/login', request.url));
        // Clear cookies just in case
        response.cookies.delete('token');
        response.cookies.delete('user_role');
        return response;
    }

    // 4. Authorized access
    // If on root, redirect to dashboard
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
