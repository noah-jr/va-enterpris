import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_for_mvp';
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn('[authMiddleware] AVISO: API_KEY não configurada no .env — acesso por API key desactivado.');
}

// Extend the Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
            companyId?: string;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const incomingApiKey = req.headers['x-api-key'];

    // 1. Try JWT Auth first (User session)
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded: any = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            
            // Standardize companyId: Regular users must stick to their JWT companyId
            // Only Super Admins or System Keys can switch company context via header
            if (decoded.role?.toUpperCase() === 'SUPER_ADMIN') {
                req.companyId = (req.headers['x-company-id'] as string) || decoded.companyId;
            } else {
                req.companyId = decoded.companyId;
            }

            return next();
        } catch (err) {
            // Token invalid but check for API key fallback before failing
            if (!incomingApiKey || incomingApiKey !== API_KEY) {
                return res.status(401).json({ error: 'Token inválido ou expirado.' });
            }
        }
    }

    // 2. Fallback to Master/System API Key
    if (incomingApiKey && incomingApiKey === API_KEY) {
        req.companyId = req.headers['x-company-id'] as string;
        return next();
    }

    return res.status(401).json({ error: 'Nenhum token fornecido ou API Key inválida.' });
};
