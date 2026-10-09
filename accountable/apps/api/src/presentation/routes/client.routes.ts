import type { FastifyPluginAsync } from 'fastify';
import type { ClientController } from '../controllers/client.controller.js';
import type { ITokenService } from '../../application/contracts/auth.contract.js';
import { createRequireUserMiddleware } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

export interface ClientRoutesOptions {
  clientController: ClientController;
  tokenService: ITokenService;
}

export const clientRoutes: FastifyPluginAsync<ClientRoutesOptions> = async (
  fastify,
  opts,
) => {
  const { clientController, tokenService } = opts;
  const requireUser = createRequireUserMiddleware(tokenService);
  const requireClientsRead = requirePermission('clients:read');
  const requireClientsBlock = requirePermission('clients:block');

  fastify.get('/', { preHandler: [requireUser, requireClientsRead] }, clientController.list.bind(clientController));
  fastify.get('/:id', { preHandler: [requireUser, requireClientsRead] }, clientController.getById.bind(clientController));
  fastify.patch('/:id/block', { preHandler: [requireUser, requireClientsBlock] }, clientController.block.bind(clientController));
  fastify.patch('/:id/unblock', { preHandler: [requireUser, requireClientsBlock] }, clientController.unblock.bind(clientController));
};
