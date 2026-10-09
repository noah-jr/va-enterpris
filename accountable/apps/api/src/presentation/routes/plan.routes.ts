import type { FastifyPluginAsync } from 'fastify';
import type { PlanController } from '../controllers/plan.controller.js';
import type { ITokenService } from '../../application/contracts/auth.contract.js';
import { createRequireUserMiddleware } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

export interface PlanRoutesOptions {
  planController: PlanController;
  tokenService: ITokenService;
}

export const publicPlanRoutes: FastifyPluginAsync<PlanRoutesOptions> = async (fastify, opts) => {
  const { planController } = opts;

  fastify.get('/', planController.listPublic.bind(planController));
};

export const adminPlanRoutes: FastifyPluginAsync<PlanRoutesOptions> = async (fastify, opts) => {
  const { planController, tokenService } = opts;
  const requireUser = createRequireUserMiddleware(tokenService);
  const requirePlansRead = requirePermission('plans:read');
  const requirePlansManage = requirePermission('plans:manage');

  fastify.get('/', { preHandler: [requireUser, requirePlansRead] }, planController.listAll.bind(planController));
  fastify.post('/', { preHandler: [requireUser, requirePlansManage] }, planController.create.bind(planController));
  fastify.patch('/:id', { preHandler: [requireUser, requirePlansManage] }, planController.update.bind(planController));
  fastify.delete('/:id', { preHandler: [requireUser, requirePlansManage] }, planController.remove.bind(planController));
};
