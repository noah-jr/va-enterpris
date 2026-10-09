import type { FastifyInstance } from 'fastify';
import type { NotificationController } from '../controllers/notification.controller.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';
import type { ITokenService } from '../../application/contracts/auth.contract.js';

export interface NotificationRoutesOptions {
  notificationController: NotificationController;
  tokenService: ITokenService;
}

export async function notificationRoutes(
  fastify: FastifyInstance,
  options: NotificationRoutesOptions,
): Promise<void> {
  const { notificationController, tokenService } = options;
  const authenticate = createAuthMiddleware(tokenService);

  fastify.addHook('preHandler', authenticate);

  fastify.get('/', (req, rep) => notificationController.list(req, rep));

  fastify.patch<{ Params: { id: string } }>('/:id/read', (req, rep) =>
    notificationController.markRead(req, rep),
  );
}
