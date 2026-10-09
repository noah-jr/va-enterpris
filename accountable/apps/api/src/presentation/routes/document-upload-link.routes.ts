import type { FastifyPluginAsync } from 'fastify';
import type { DocumentUploadLinkController } from '../controllers/document-upload-link.controller.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';
import type { ITokenService } from '../../application/contracts/auth.contract.js';

export interface DocumentUploadLinkRoutesOptions {
  documentUploadLinkController: DocumentUploadLinkController;
  tokenService: ITokenService;
}

const publicContextRateLimit = {
  max: parseInt(process.env.RATE_LIMIT_UPLOAD_LINK_CONTEXT_MAX || '20', 10),
  timeWindow: parseInt(process.env.RATE_LIMIT_UPLOAD_LINK_CONTEXT_WINDOW_MS || '60000', 10),
};

const publicUploadRateLimit = {
  max: parseInt(process.env.RATE_LIMIT_UPLOAD_LINK_UPLOAD_MAX || '10', 10),
  timeWindow: parseInt(process.env.RATE_LIMIT_UPLOAD_LINK_UPLOAD_WINDOW_MS || '60000', 10),
};

export const documentUploadLinkAdminRoutes: FastifyPluginAsync<DocumentUploadLinkRoutesOptions> = async (
  fastify,
  options,
) => {
  const { documentUploadLinkController, tokenService } = options;
  const authenticate = createAuthMiddleware(tokenService);
  const requireUploadLinkPermission = requirePermission('documents:request_file');

  fastify.addHook('preHandler', authenticate);

  fastify.post<{ Params: { id: string } }>(
    '/:id/upload-links',
    { preHandler: [requireUploadLinkPermission] },
    (req, rep) => documentUploadLinkController.create(req, rep),
  );

  fastify.delete<{ Params: { id: string; linkId: string } }>(
    '/:id/upload-links/:linkId',
    { preHandler: [requireUploadLinkPermission] },
    (req, rep) => documentUploadLinkController.revoke(req, rep),
  );
};

export const documentUploadLinkPublicRoutes: FastifyPluginAsync<DocumentUploadLinkRoutesOptions> = async (
  fastify,
  options,
) => {
  const { documentUploadLinkController } = options;

  fastify.get<{ Params: { token: string } }>(
    '/:token',
    { config: { rateLimit: publicContextRateLimit } },
    (req, rep) => documentUploadLinkController.getPublicContext(req, rep),
  );

  fastify.post<{ Params: { token: string } }>(
    '/:token/files',
    { config: { rateLimit: publicUploadRateLimit } },
    (req, rep) => documentUploadLinkController.uploadPublicFile(req, rep),
  );
};
