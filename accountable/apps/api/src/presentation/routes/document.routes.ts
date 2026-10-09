import type { FastifyInstance } from 'fastify';
import type { DocumentController } from '../controllers/document.controller.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';
import { requirePermission, requirePermissionIfUser } from '../middlewares/rbac.middleware.js';

import type { ITokenService } from '../../application/contracts/auth.contract.js';

export interface DocumentRoutesOptions {
  documentController: DocumentController;
  tokenService: ITokenService;
}

export async function documentRoutes(
  fastify: FastifyInstance,
  options: DocumentRoutesOptions,
): Promise<void> {
  const { documentController, tokenService } = options;
  const authenticate = createAuthMiddleware(tokenService);

  // Todos os endpoints de documentos exigem autenticação
  fastify.addHook('preHandler', authenticate);

  // Listar documentos (clientes vêem os seus; utilizadores internos precisam de documents:read)
  fastify.get(
    '/',
    { preHandler: [requirePermissionIfUser('documents:read')] },
    (req, rep) => documentController.list(req, rep),
  );

  // Criar documento (clientes criam os seus; utilizadores internos precisam de documents:create)
  fastify.post(
    '/',
    { preHandler: [requirePermissionIfUser('documents:create')] },
    (req, rep) => documentController.create(req, rep),
  );

  // Obter detalhes de um documento por ID
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [requirePermissionIfUser('documents:read')] },
    (req, rep) => documentController.getById(req, rep),
  );

  // Alterar estado do documento
  fastify.patch<{ Params: { id: string } }>(
    '/:id/status',
    { preHandler: [requirePermissionIfUser('documents:change_status')] },
    (req, rep) => documentController.updateStatus(req, rep),
  );

  // Upload de ficheiro para o documento
  fastify.post<{ Params: { id: string } }>(
    '/:id/files',
    { preHandler: [requirePermissionIfUser('files:upload')] },
    (req, rep) => documentController.uploadFile(req, rep),
  );

  // Análise OCR e apoio à decisão do consultor — ferramenta interna, vedada a clientes
  fastify.get<{ Params: { id: string } }>(
    '/:id/ocr',
    { preHandler: [requirePermission('documents:read')] },
    (req, rep) => documentController.getOcr(req, rep),
  );

  fastify.post<{ Params: { id: string } }>(
    '/:id/ocr',
    { preHandler: [requirePermission('documents:read')] },
    (req, rep) => documentController.getOcr(req, rep),
  );
}
