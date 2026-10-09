import {
  CreateDocumentUseCase,
  UpdateDocumentStatusUseCase,
  UploadDocumentFileUseCase,
  GetDocumentUseCase,
  ListDocumentsUseCase,
  GetDocumentOcrUseCase,
} from '../application/use-cases/documents/index.js';
import { DocumentController } from '../presentation/controllers/document.controller.js';
import type { Infrastructure } from './infrastructure.js';

export function buildDocumentController(infra: Infrastructure): DocumentController {
  const { fileStorage, emailService, ocrService, config, repositories, unitOfWork } = infra;
  const maxFileSizeBytes = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10) * 1024 * 1024;
  const {
    documentRepository,
    documentStatusHistoryRepository,
    documentFileRepository,
    clientRepository,
    auditRepository,
  } = repositories;

  const createDocumentUseCase = new CreateDocumentUseCase(
    documentRepository,
    documentStatusHistoryRepository,
    clientRepository,
    auditRepository,
    unitOfWork,
  );

  const updateDocumentStatusUseCase = new UpdateDocumentStatusUseCase(
    documentRepository,
    documentStatusHistoryRepository,
    clientRepository,
    emailService,
    auditRepository,
    config.appUrl,
    unitOfWork,
  );

  const uploadDocumentFileUseCase = new UploadDocumentFileUseCase(
    documentRepository,
    documentFileRepository,
    fileStorage,
    auditRepository,
    unitOfWork,
    config.documentsBucket,
    maxFileSizeBytes,
  );

  const getDocumentUseCase = new GetDocumentUseCase(
    documentRepository,
    documentFileRepository,
    documentStatusHistoryRepository,
    fileStorage,
    config.documentsBucket,
  );

  const listDocumentsUseCase = new ListDocumentsUseCase(documentRepository);

  const getDocumentOcrUseCase = new GetDocumentOcrUseCase(
    documentRepository,
    documentFileRepository,
    fileStorage,
    ocrService,
    config.documentsBucket,
  );

  return new DocumentController({
    createDocumentUseCase,
    updateDocumentStatusUseCase,
    uploadDocumentFileUseCase,
    getDocumentUseCase,
    listDocumentsUseCase,
    getDocumentOcrUseCase,
  });
}
