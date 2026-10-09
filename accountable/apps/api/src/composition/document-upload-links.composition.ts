import {
  CreateDocumentUploadLinkUseCase,
  RevokeDocumentUploadLinkUseCase,
  GetUploadLinkContextUseCase,
  UploadViaPublicLinkUseCase,
} from '../application/use-cases/document-upload-links/index.js';
import { DocumentUploadLinkController } from '../presentation/controllers/document-upload-link.controller.js';
import type { Infrastructure } from './infrastructure.js';

export function buildDocumentUploadLinkController(infra: Infrastructure): DocumentUploadLinkController {
  const { fileStorage, config, repositories, tokenService, unitOfWork } = infra;
  const {
    documentRepository,
    documentFileRepository,
    auditRepository,
    documentUploadLinkRepository,
  } = repositories;

  const createDocumentUploadLinkUseCase = new CreateDocumentUploadLinkUseCase(
    documentRepository,
    documentUploadLinkRepository,
    auditRepository,
    tokenService,
    unitOfWork,
  );

  const revokeDocumentUploadLinkUseCase = new RevokeDocumentUploadLinkUseCase(
    documentUploadLinkRepository,
    auditRepository,
    unitOfWork,
  );

  const getUploadLinkContextUseCase = new GetUploadLinkContextUseCase(
    documentUploadLinkRepository,
    documentRepository,
    documentFileRepository,
    tokenService,
  );

  const uploadViaPublicLinkUseCase = new UploadViaPublicLinkUseCase(
    documentUploadLinkRepository,
    documentRepository,
    documentFileRepository,
    fileStorage,
    auditRepository,
    tokenService,
    unitOfWork,
    config.documentsBucket,
  );

  return new DocumentUploadLinkController({
    createDocumentUploadLinkUseCase,
    revokeDocumentUploadLinkUseCase,
    getUploadLinkContextUseCase,
    uploadViaPublicLinkUseCase,
    clientAppUrl: config.appUrl,
  });
}
