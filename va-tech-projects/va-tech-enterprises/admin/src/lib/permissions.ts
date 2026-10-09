export type Role = 'ADMIN' | 'COMERCIAL' | 'MARKETING' | 'TI' | 'INTERNAUTA' | 'EDITOR';

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
    ADMIN: ['*'],
    EDITOR: [
        '/',
        '/services',
        '/projects',
        '/posts',
        '/testimonials',
        '/partners',
        '/profile',
        '/help',
    ],
    COMERCIAL: [
        '/',
        '/services',
        '/projects',
        '/internautas',
        '/contacts',
        '/messages',
        '/contracts',
        '/profile',
        '/help',
        '/dashboard/charts'
    ],
    MARKETING: [
        '/',
        '/services',
        '/projects',
        '/posts',
        '/testimonials',
        '/partners',
        '/internautas',
        '/contacts',
        '/newsletter',
        '/profile',
        '/help',
        '/dashboard/charts'
    ],
    TI: [
        '/',
        '/messages',
        '/sectors',
        '/users',
        '/files',
        '/backup',
        '/settings',
        '/profile',
        '/help',
        '/security',
        '/dashboard/charts'
    ],
    INTERNAUTA: [
        '/',
        '/profile',
        '/help',
        '/internauta' // Allow access to internauta specific routes if they exist
    ]
};

export function hasPermission(role: string | null | undefined, path: string): boolean {
    if (!role) return false;

    // If it's a known admin role
    const userRole = role as Role;
    const permissions = ROLE_PERMISSIONS[userRole];

    if (!permissions) return false;
    if (permissions.includes('*')) return true;

    // Normalize path (remove query params)
    const cleanPath = path.split('?')[0];

    // Check if path matches or is a subpath of an allowed path
    return permissions.some(allowedPath => {
        if (allowedPath === '/') {
            return cleanPath === '/';
        }
        return cleanPath === allowedPath || cleanPath.startsWith(allowedPath + '/');
    });
}
