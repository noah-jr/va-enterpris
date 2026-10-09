import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';


export const rbacMiddleware = (requiredPermissions: string[] = [], allowedRoles: string[] = []) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        // Always require an authenticated user — no bypass without user object
        if (!user) {
            return res.status(401).json({ error: 'Sessão inválida. Autentique-se primeiro.' });
        }

        // Super Admin bypasses everything
        if (user.role?.toUpperCase() === 'SUPER_ADMIN') {
            return next();
        }

        // 1. Check by Role (Database Driven)
        // If allowedRoles is provided, we check if the user's role is in the list
        if (allowedRoles.length > 0) {
            if (allowedRoles.includes(user.role)) {
                return next();
            }
        }

        // 2. Check by Permissions (Granular)
        if (requiredPermissions.length > 0) {
            // Get permissions from user object (if in JWT) or fetch from DB
            let userPermissions = user.permissions || [];

            if (userPermissions.length === 0) {
                const targetId = user.roleId;
                const targetRole = user.role;

                if (targetId) {
                    const role = await prisma.role.findUnique({
                        where: { id: targetId },
                        include: { permissions: true }
                    }) as any;
                    userPermissions = role?.permissions?.map((p: any) => p.name) || [];
                } else if (targetRole) {
                    // Fallback to searching by role name if roleId is missing (e.g. from an old token)
                    const role = await prisma.role.findFirst({
                        where: { name: targetRole },
                        include: { permissions: true }
                    }) as any;
                    userPermissions = role?.permissions?.map((p: any) => p.name) || [];
                }
            }

            const hasAllPermissions = requiredPermissions.every(perm => userPermissions.includes(perm));

            if (hasAllPermissions) {
                return next();
            }

            return res.status(403).json({
                error: 'Permissão insuficiente.',
                requiredPermissions,
                missingPermissions: requiredPermissions.filter(p => !userPermissions.includes(p))
            });
        }

        // If we reached here and had allowedRoles, but user didn't match, fail
        if (allowedRoles.length > 0) {
            return res.status(403).json({
                error: 'Cargo insuficiente.',
                requiredRoles: allowedRoles,
                currentRole: user.role
            });
        }

        next();
    };
};
