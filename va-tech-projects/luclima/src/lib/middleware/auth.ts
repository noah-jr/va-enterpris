import { NextRequest } from 'next/server';
import { AuthUseCases } from '@/application/use-cases/auth.use-cases';
import { userRepository } from '@/infrastructure/repositories';

const authUseCases = new AuthUseCases(userRepository);

export interface AuthenticatedRequest extends NextRequest {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}

export async function authenticate(request: NextRequest): Promise<{
    authenticated: boolean;
    user?: { userId: string; email: string; role: string };
    error?: string;
}> {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                authenticated: false,
                error: 'Token não fornecido',
            };
        }

        const token = authHeader.substring(7);
        const decoded = await authUseCases.verifyToken(token);

        return {
            authenticated: true,
            user: decoded,
        };
    } catch (error: any) {
        return {
            authenticated: false,
            error: error.message || 'Token inválido',
        };
    }
}

export function requireAuth(allowedRoles?: string[]) {
    return async (request: NextRequest) => {
        const auth = await authenticate(request);

        if (!auth.authenticated || !auth.user) {
            return {
                authorized: false,
                error: auth.error || 'Não autenticado',
                status: 401,
            };
        }

        if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
            return {
                authorized: false,
                error: 'Sem permissão',
                status: 403,
            };
        }

        return {
            authorized: true,
            user: auth.user,
        };
    };
}
