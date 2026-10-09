import type { FastifyPluginAsync } from 'fastify';
import type { DocumentTypeController } from '../controllers/document-type.controller.js';
import type { ITokenService } from '../../application/contracts/auth.contract.js';
import { createRequireUserMiddleware } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';

export interface DocumentTypeRoutesOptions {
  documentTypeController: DocumentTypeController;
  tokenService: ITokenService;
}

export const publicDocumentTypeRoutes: FastifyPluginAsync<DocumentTypeRoutesOptions> = async (
  fastify,
  opts,
) => {
  const { documentTypeController } = opts;

  // Endpoint acessível para carregar a lista de tipos de documentos ativos (usado pelo cliente e no envio público)
  fastify.get('/', documentTypeController.listActive.bind(documentTypeController));
};

export const adminDocumentTypeRoutes: FastifyPluginAsync<DocumentTypeRoutesOptions> = async (
  fastify,
  opts,
) => {
  const { documentTypeController, tokenService } = opts;
  const requireUser = createRequireUserMiddleware(tokenService);
  const requireDocTypesRead = requirePermission('document_types:read');
  const requireDocTypesManage = requirePermission('document_types:manage');

  fastify.get(
    '/',
    { preHandler: [requireUser, requireDocTypesRead] },
    documentTypeController.listAll.bind(documentTypeController),
  );
  fastify.post(
    '/',
    { preHandler: [requireUser, requireDocTypesManage] },
    documentTypeController.create.bind(documentTypeController),
  );
  fastify.patch(
    '/:id',
    { preHandler: [requireUser, requireDocTypesManage] },
    documentTypeController.update.bind(documentTypeController),
  );
  fastify.delete(
    '/:id',
    { preHandler: [requireUser, requireDocTypesManage] },
    documentTypeController.remove.bind(documentTypeController),
  );
};
