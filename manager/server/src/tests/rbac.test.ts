import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

/**
 * rbacMiddleware Integration Tests
 *
 * Validates that the RBAC middleware correctly:
 *   1. Blocks unauthenticated requests (401)
 *   2. Allows SUPER_ADMIN through without permission checks
 *   3. Allows requests where user already has the required permission in token
 *   4. Blocks requests where user has insufficient permissions (403)
 *   5. Allows access based on role list
 *   6. Blocks access when role is not in the allowed list
 */

// ── Mock Prisma to avoid real DB in unit tests ────────────────────────────────
vi.mock('../lib/prisma', () => ({
    default: {
        role: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
        }
    }
}));

import prisma from '../lib/prisma';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

function mockRequest(overrides: Partial<any> = {}): Partial<Request> {
    return {
        user: { id: 'user-1', role: 'ADMIN', companyId: 'company-1' },
        companyId: 'company-1',
        ...overrides,
    };
}

function mockResponse() {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res as Response;
}

describe('rbacMiddleware (RBAC Integration)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ── 1. No authentication ──────────────────────────────────────────────────
    it('should return 401 when user is not authenticated', async () => {
        const middleware = rbacMiddleware(['invoices:view']);
        const req = mockRequest({ user: undefined, companyId: undefined }) as Request;
        const res = mockResponse();
        const next = vi.fn();

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    // ── 2. SUPER_ADMIN bypass ─────────────────────────────────────────────────
    it('should allow SUPER_ADMIN through without any permission checks', async () => {
        const middleware = rbacMiddleware(['any:permission']);
        const req = mockRequest({ user: { id: 'sa-1', role: 'SUPER_ADMIN', companyId: 'c-1' } }) as Request;
        const res = mockResponse();
        const next = vi.fn();

        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        // Prisma should NOT be queried for SUPER_ADMIN
        expect(prisma.role.findUnique).not.toHaveBeenCalled();
        expect(prisma.role.findFirst).not.toHaveBeenCalled();
    });

    // ── 3. Permission in token (no DB lookup needed) ──────────────────────────
    it('should call next() when user token already contains the required permission', async () => {
        const middleware = rbacMiddleware(['invoices:view']);
        const req = mockRequest({
            user: { id: 'u-1', role: 'ADMIN', companyId: 'c-1', permissions: ['invoices:view', 'clients:view'] }
        }) as Request;
        const res = mockResponse();
        const next = vi.fn();

        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    // ── 4. Missing permission → 403 ───────────────────────────────────────────
    it('should return 403 when user does not have the required permission', async () => {
        (prisma.role.findFirst as any).mockResolvedValue(null);
        (prisma.role.findUnique as any).mockResolvedValue(null);

        const middleware = rbacMiddleware(['payroll:manage']);
        const req = mockRequest({
            user: { id: 'u-2', role: 'USER', companyId: 'c-1', permissions: ['clients:view'] }
        }) as Request;
        const res = mockResponse();
        const next = vi.fn();

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    // ── 5. Role-based allow ───────────────────────────────────────────────────
    it('should allow access when user role matches allowed roles list', async () => {
        const middleware = rbacMiddleware([], ['ADMIN', 'MANAGER']);
        const req = mockRequest({ user: { id: 'u-3', role: 'ADMIN', companyId: 'c-1' } }) as Request;
        const res = mockResponse();
        const next = vi.fn();

        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    // ── 6. Role-based block → 403 ─────────────────────────────────────────────
    it('should return 403 when user role is not in the required roles list', async () => {
        (prisma.role.findFirst as any).mockResolvedValue(null);
        (prisma.role.findUnique as any).mockResolvedValue(null);

        const middleware = rbacMiddleware([], ['SUPER_ADMIN']);
        const req = mockRequest({ user: { id: 'u-4', role: 'USER', companyId: 'c-1' } }) as Request;
        const res = mockResponse();
        const next = vi.fn();

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});
