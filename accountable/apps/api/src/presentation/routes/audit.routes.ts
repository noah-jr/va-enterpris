import type { FastifyPluginAsync } from 'fastify';
import type { AuditController } from '../controllers/audit.controller.js';
import type { ITokenService } from '../../application/contracts/auth.contract.js';
import { createRequireUserMiddleware } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

export interface AuditRoutesOptions {
  auditController: AuditController;
  tokenService: ITokenService;
}

export const auditRoutes: FastifyPluginAsync<AuditRoutesOptions> = async (
  fastify,
  opts,
) => {
  const { auditController, tokenService } = opts;
  const requireUser = createRequireUserMiddleware(tokenService);

  fastify.get(
    '/',
    { preHandler: [requireUser, requirePermission('audit:read')] },
    auditController.list.bind(auditController),
  );
};
