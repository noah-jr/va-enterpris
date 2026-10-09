import type { FastifyPluginAsync } from 'fastify';
import type { ITokenService } from '../../application/contracts/auth.contract.js';
import type {
  EmailSettingsController,
  StatsController,
  SubscriptionController,
} from '../controllers/admin-settings.controller.js';
import { createAuthMiddleware, createRequireUserMiddleware } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

interface Options {
  tokenService: ITokenService;
  emailSettingsController: EmailSettingsController;
  subscriptionController: SubscriptionController;
  statsController: StatsController;
}

const testEmailRateLimit = {
  max: parseInt(process.env.RATE_LIMIT_TOKEN_MAX || '20', 10),
  timeWindow: parseInt(process.env.RATE_LIMIT_TOKEN_WINDOW_MS || '60000', 10),
};

/** /api/v1/admin/... — apenas utilizadores internos com a permissão certa. */
export const adminSettingsRoutes: FastifyPluginAsync<Options> = async (fastify, opts) => {
  const { emailSettingsController: email, subscriptionController: subs, statsController: stats } = opts;
  fastify.addHook('preHandler', createRequireUserMiddleware(opts.tokenService));

  const settings = requirePermission('settings:manage');
  fastify.get('/settings/email', { preHandler: [settings] }, (req, rep) => email.get(req, rep));
  fastify.put('/settings/email', { preHandler: [settings] }, (req, rep) => email.update(req, rep));
  fastify.post(
    '/settings/email/test',
    { preHandler: [settings], config: { rateLimit: testEmailRateLimit } },
    (req, rep) => email.test(req, rep),
  );

  fastify.get('/subscriptions', { preHandler: [requirePermission('subscriptions:read')] }, (req, rep) => subs.list(req, rep));
  fastify.post('/subscriptions', { preHandler: [requirePermission('subscriptions:manage')] }, (req, rep) =>
    subs.create(req, rep),
  );
  fastify.patch<{ Params: { id: string } }>(
    '/subscriptions/:id',
    { preHandler: [requirePermission('subscriptions:manage')] },
    (req, rep) => subs.update(req, rep),
  );
  fastify.post<{ Params: { id: string } }>(
    '/subscriptions/:id/renew',
    { preHandler: [requirePermission('subscriptions:manage')] },
    (req, rep) => subs.renew(req, rep),
  );

  fastify.get('/stats/overview', { preHandler: [requirePermission('reports:read')] }, (req, rep) =>
    stats.overview(req, rep),
  );
};

/** /api/v1/subscriptions/me — cliente vê a própria subscrição. */
export const clientSubscriptionRoutes: FastifyPluginAsync<Options> = async (fastify, opts) => {
  fastify.get('/me', { preHandler: [createAuthMiddleware(opts.tokenService)] }, (req, rep) =>
    opts.subscriptionController.mine(req, rep),
  );
};
