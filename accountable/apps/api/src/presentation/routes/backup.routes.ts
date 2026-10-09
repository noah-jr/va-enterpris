import type { FastifyPluginAsync } from 'fastify';
import type { BackupController } from '../controllers/backup.controller.js';
import type { ITokenService } from '../../application/contracts/auth.contract.js';
import { createRequireUserMiddleware } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

export interface BackupRoutesOptions {
  backupController: BackupController;
  tokenService: ITokenService;
}

export const backupRoutes: FastifyPluginAsync<BackupRoutesOptions> = async (
  fastify,
  opts,
) => {
  const { backupController, tokenService } = opts;
  const requireUser = createRequireUserMiddleware(tokenService);

  fastify.get(
    '/',
    { preHandler: [requireUser, requirePermission('backups:read')] },
    backupController.list.bind(backupController),
  );
  fastify.post(
    '/',
    { preHandler: [requireUser, requirePermission('backups:create')] },
    backupController.create.bind(backupController),
  );
};
