import type { FastifyPluginAsync } from 'fastify';
import type { ContactController } from '../controllers/contact.controller.js';
import type { ITokenService } from '../../application/contracts/auth.contract.js';
import { createRequireUserMiddleware } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

export interface ContactRoutesOptions {
  contactController: ContactController;
  tokenService: ITokenService;
}

const contactRateLimit = {
  max: parseInt(process.env.RATE_LIMIT_CONTACT_MAX || '5', 10),
  timeWindow: parseInt(process.env.RATE_LIMIT_CONTACT_WINDOW_MS || '60000', 10),
};

const newsletterRateLimit = {
  max: parseInt(process.env.RATE_LIMIT_NEWSLETTER_MAX || '10', 10),
  timeWindow: parseInt(process.env.RATE_LIMIT_NEWSLETTER_WINDOW_MS || '60000', 10),
};

export const publicContactRoutes: FastifyPluginAsync<ContactRoutesOptions> = async (fastify, opts) => {
  const { contactController } = opts;

  fastify.post(
    '/contact',
    { config: { rateLimit: contactRateLimit } },
    contactController.submit.bind(contactController),
  );

  fastify.post(
    '/newsletter',
    { config: { rateLimit: newsletterRateLimit } },
    contactController.subscribe.bind(contactController),
  );
};

export const adminContactRoutes: FastifyPluginAsync<ContactRoutesOptions> = async (fastify, opts) => {
  const { contactController, tokenService } = opts;
  const requireUser = createRequireUserMiddleware(tokenService);
  const requireContactsRead = requirePermission('contacts:read');

  fastify.get(
    '/',
    { preHandler: [requireUser, requireContactsRead] },
    contactController.list.bind(contactController),
  );
};
