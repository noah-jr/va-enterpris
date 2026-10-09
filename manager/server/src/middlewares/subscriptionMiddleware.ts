import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { MODULE_API_MAPPING } from '../config/moduleMapping';

export const subscriptionMiddleware = async (req: Request, res: Response, next: NextFunction) => {


    const companyId = req.companyId;

    // Skip check for:
    // 1. System API key request (no companyId)
    // 2. Super Admin users (platform management)
    if (req.user?.role?.toUpperCase() === 'SUPER_ADMIN') {
        return next();
    }

    // 2. System API key request or missing companyId (handled by other guards if needed)
    if (!companyId) {
        return next();
    }

    // 3. Allow upgrade/billing paths to bypass even if expired (fix for deadlocked accounts)
    const bypassPaths = [
        '/api/company-admin/upgrade-plan',
        '/api/company-admin/subscription',
        '/api/company-admin/plans',
        '/api/admin/companies', // SuperAdmin needs this
        '/api/auth/me', // Critical for frontend state
        '/api/tickets' // Allow support ticketing even if expired
    ];

    if (bypassPaths.some(p => req.originalUrl.startsWith(p))) {
        return next();
    }

    try {
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { status: true, enabledModules: true, expiresAt: true } as any
        }) as any;

        if (!company || company.status !== 'ACTIVE') {
            const message = company?.status === 'BLOCKED'
                ? 'A sua conta foi bloqueada por um administrador do sistema.'
                : 'A sua conta aguarda aprovação administrativa.';

            return res.status(403).json({
                error: message,
                code: company?.status === 'BLOCKED' ? 'COMPANY_BLOCKED' : 'COMPANY_PENDING'
            });
        }

        if (company.expiresAt && new Date(company.expiresAt) < new Date()) {
            return res.status(403).json({
                error: 'A sua conta expirou. Contacte o administrador para prorrogar o acesso.',
                code: 'COMPANY_EXPIRED'
            });
        }

        // Restrições de Módulos Gated para SaaS Clients
        const pathParts = req.originalUrl.split('/');
        const prefix = pathParts[2]; // ex: '/api/invoices/...' -> 'invoices'
        const blockedPrefixes = [
            'invoices', 'pos', 'clients', 'suppliers', 
            'products', 'services', 'fiscal', 'saft', 
            'documents', 'legal', 'purchasing', 'marketing', 
            'production', 'logistics', 'maintenance', 'fleet', 
            'inventory', 'assets', 'projects'
        ];

        if (prefix && blockedPrefixes.includes(prefix)) {
            return res.status(403).json({
                error: 'Este módulo não está disponível para a sua conta SaaS.',
                code: 'MODULE_GATED'
            });
        }

        // 4. Check if the subcription is active/not expired (Only if no explicit valid expiresAt on company level)
        if (!company.expiresAt) {
            const subscription = await prisma.subscription.findFirst({
                where: {
                    companyId,
                    status: 'ACTIVE',
                    endDate: { gte: new Date() }
                }
            });

            if (!subscription) {
                console.warn(`[SubscriptionCheck] Forbidden: Company ${companyId} has no active subscription. User role: ${req.user?.role}`);
                return res.status(403).json({
                    error: 'Subscrição inativa ou expirada. Por favor renove o seu plano para continuar.',
                    code: 'SUBSCRIPTION_EXPIRED'
                });
            }
        }



        if (prefix && MODULE_API_MAPPING[prefix]) {
            const requiredModule = MODULE_API_MAPPING[prefix];

            // requiredModule can be a string or an array of strings
            const requiredModulesList = Array.isArray(requiredModule) ? requiredModule : [requiredModule];
            
            // Check if user has AT LEAST ONE of the required modules for this path
            const hasModule = requiredModulesList.some(mod => (company.enabledModules || []).includes(mod));

            if (!hasModule) {
                return res.status(403).json({
                    error: `Precisa de um dos módulos: '${requiredModulesList.join(' ou ')}' para aceder a esta funcionalidade.`,
                    code: 'MODULE_NOT_ENABLED',
                    module: requiredModulesList[0]
                });
            }
        }

        next();
    } catch (err) {
        res.status(500).json({ error: 'Erro ao verificar subscrição.' });
    }
};
