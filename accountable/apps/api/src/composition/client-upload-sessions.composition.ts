import {
  CreateClientUploadSessionUseCase,
  GetClientUploadSessionContextUseCase,
  UploadDocumentViaSessionUseCase,
  ListClientUploadSessionsUseCase,
  RevokeClientUploadSessionUseCase,
} from '../application/use-cases/client-upload-sessions/index.js';
import { ClientUploadSessionController } from '../presentation/controllers/client-upload-session.controller.js';
import type { Infrastructure } from './infrastructure.js';

export function buildClientUploadSessionController(infra: Infrastructure): ClientUploadSessionController {
  const { fileStorage, config, repositories, tokenService, secretCipher, unitOfWork } = infra;
  const sessionTtlDays = parseInt(process.env.UPLOAD_SESSION_TTL_DAYS || '30', 10);
  const {
    clientRepository,
    clientUploadSessionRepository,
    documentRepository,
    documentFileRepository,
    documentStatusHistoryRepository,
    auditRepository,
  } = repositories;

  const createClientUploadSessionUseCase = new CreateClientUploadSessionUseCase(
    clientRepository,
    clientUploadSessionRepository,
    auditRepository,
    tokenService,
    secretCipher,
    unitOfWork,
    config.appUrl,
    sessionTtlDays,
  );

  const getClientUploadSessionContextUseCase = new GetClientUploadSessionContextUseCase(
    clientUploadSessionRepository,
    clientRepository,
    tokenService,
  );

  const uploadDocumentViaSessionUseCase = new UploadDocumentViaSessionUseCase(
    clientUploadSessionRepository,
    clientRepository,
    documentRepository,
    documentFileRepository,
    documentStatusHistoryRepository,
    fileStorage,
    auditRepository,
    tokenService,
    unitOfWork,
    config.documentsBucket,
  );

  const listClientUploadSessionsUseCase = new ListClientUploadSessionsUseCase(
    clientRepository,
    clientUploadSessionRepository,
    secretCipher,
    config.appUrl,
  );

  const revokeClientUploadSessionUseCase = new RevokeClientUploadSessionUseCase(
    clientUploadSessionRepository,
    auditRepository,
    unitOfWork,
  );

  return new ClientUploadSessionController({
    createClientUploadSessionUseCase,
    getClientUploadSessionContextUseCase,
    uploadDocumentViaSessionUseCase,
    listClientUploadSessionsUseCase,
    revokeClientUploadSessionUseCase,
  });
}
