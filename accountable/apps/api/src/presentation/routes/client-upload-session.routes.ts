import type { FastifyPluginAsync } from 'fastify';
import type { ClientUploadSessionController } from '../controllers/client-upload-session.controller.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';
import type { ITokenService } from '../../application/contracts/auth.contract.js';
import { requireSelfClientOrPermission } from '../middlewares/rbac.middleware.js';

export interface ClientUploadSessionRoutesOptions {
  clientUploadSessionController: ClientUploadSessionController;
  tokenService: ITokenService;
}

const publicContextRateLimit = {
  max: parseInt(process.env.RATE_LIMIT_UPLOAD_SESSION_CONTEXT_MAX || '30', 10),
  timeWindow: parseInt(process.env.RATE_LIMIT_UPLOAD_SESSION_CONTEXT_WINDOW_MS || '60000', 10),
};

const publicUploadRateLimit = {
  max: parseInt(process.env.RATE_LIMIT_UPLOAD_SESSION_UPLOAD_MAX || '20', 10),
  timeWindow: parseInt(process.env.RATE_LIMIT_UPLOAD_SESSION_UPLOAD_WINDOW_MS || '60000', 10),
};

export const clientUploadSessionAdminRoutes: FastifyPluginAsync<ClientUploadSessionRoutesOptions> = async (
  fastify,
  options,
) => {
  const { clientUploadSessionController, tokenService } = options;
  const authenticate = createAuthMiddleware(tokenService);

  // Clientes gerem apenas as próprias sessões; colaboradores precisam da permissão.
  const checkManagePermission = requireSelfClientOrPermission('documents:request_file');
  const checkReadPermission = requireSelfClientOrPermission('clients:read');

  fastify.addHook('preHandler', authenticate);

  fastify.post<{ Params: { id: string } }>(
    '/:id/upload-sessions',
    { preHandler: [checkManagePermission] },
    (req, rep) => clientUploadSessionController.create(req, rep),
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id/upload-sessions',
    { preHandler: [checkReadPermission] },
    (req, rep) => clientUploadSessionController.list(req, rep),
  );

  fastify.delete<{ Params: { id: string; sessionId: string } }>(
    '/:id/upload-sessions/:sessionId',
    { preHandler: [checkManagePermission] },
    (req, rep) => clientUploadSessionController.revoke(req, rep),
  );
};

export const clientUploadSessionPublicRoutes: FastifyPluginAsync<ClientUploadSessionRoutesOptions> = async (
  fastify,
  options,
) => {
  const { clientUploadSessionController } = options;

  fastify.get<{ Querystring: { token?: string } }>(
    '/context',
    { config: { rateLimit: publicContextRateLimit } },
    (req, rep) => clientUploadSessionController.getPublicContext(req, rep),
  );

  fastify.post<{ Querystring: { token?: string } }>(
    '/upload',
    { config: { rateLimit: publicUploadRateLimit } },
    (req, rep) => clientUploadSessionController.uploadPublicFile(req, rep),
  );
};
