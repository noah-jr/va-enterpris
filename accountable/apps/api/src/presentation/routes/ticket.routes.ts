import type { FastifyInstance } from 'fastify';
import type { TicketController } from '../controllers/ticket.controller.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';
import { requirePermissionIfUser, requirePermission } from '../middlewares/rbac.middleware.js';
import type { ITokenService } from '../../application/contracts/auth.contract.js';

export interface TicketRoutesOptions {
  ticketController: TicketController;
  tokenService: ITokenService;
}

export async function ticketRoutes(
  fastify: FastifyInstance,
  options: TicketRoutesOptions,
): Promise<void> {
  const { ticketController, tokenService } = options;
  const authenticate = createAuthMiddleware(tokenService);

  fastify.addHook('preHandler', authenticate);

  fastify.get(
    '/',
    { preHandler: [requirePermissionIfUser('tickets:read')] },
    (req, rep) => ticketController.list(req, rep),
  );

  fastify.post('/', (req, rep) => ticketController.create(req, rep));

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [requirePermissionIfUser('tickets:read')] },
    (req, rep) => ticketController.getById(req, rep),
  );

  fastify.post<{ Params: { id: string } }>(
    '/:id/messages',
    { preHandler: [requirePermissionIfUser('tickets:reply')] },
    (req, rep) => ticketController.reply(req, rep),
  );

  fastify.patch<{ Params: { id: string } }>(
    '/:id/status',
    { preHandler: [requirePermission('tickets:update_status')] },
    (req, rep) => ticketController.updateStatus(req, rep),
  );
}
