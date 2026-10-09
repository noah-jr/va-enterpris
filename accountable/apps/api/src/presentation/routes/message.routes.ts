import type { FastifyInstance } from 'fastify';
import type { MessageController } from '../controllers/message.controller.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';
import { requirePermissionIfUser } from '../middlewares/rbac.middleware.js';
import type { ITokenService } from '../../application/contracts/auth.contract.js';

export interface MessageRoutesOptions {
  messageController: MessageController;
  tokenService: ITokenService;
}

export async function messageRoutes(
  fastify: FastifyInstance,
  options: MessageRoutesOptions,
): Promise<void> {
  const { messageController, tokenService } = options;
  const authenticate = createAuthMiddleware(tokenService);

  fastify.addHook('preHandler', authenticate);

  fastify.get<{ Params: { documentId: string } }>(
    '/:documentId/messages',
    { preHandler: [requirePermissionIfUser('messages:read')] },
    (req, rep) => messageController.list(req, rep),
  );

  fastify.post<{ Params: { documentId: string } }>(
    '/:documentId/messages',
    { preHandler: [requirePermissionIfUser('messages:send')] },
    async (req, rep) => {
      const body = req.body as Record<string, unknown>;
      if (req.auth?.type === 'user' && body.isInternal === true) {
        await requirePermissionIfUser('messages:send_internal')(req, rep);
      }
      await messageController.send(req, rep);
    },
  );
}
