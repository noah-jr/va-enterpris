import {
  ListActiveDocumentTypesUseCase,
  ListAllDocumentTypesUseCase,
  CreateDocumentTypeUseCase,
  UpdateDocumentTypeUseCase,
  DeleteDocumentTypeUseCase,
} from '../application/use-cases/document-types/index.js';
import { DocumentTypeController } from '../presentation/controllers/document-type.controller.js';
import type { Infrastructure } from './infrastructure.js';

export function buildDocumentTypeController(infra: Infrastructure): DocumentTypeController {
  const { documentTypeRepository, auditRepository } = infra.repositories;

  const listActiveDocumentTypesUseCase = new ListActiveDocumentTypesUseCase(documentTypeRepository);
  const listAllDocumentTypesUseCase = new ListAllDocumentTypesUseCase(documentTypeRepository);
  const createDocumentTypeUseCase = new CreateDocumentTypeUseCase(documentTypeRepository, auditRepository, infra.unitOfWork);
  const updateDocumentTypeUseCase = new UpdateDocumentTypeUseCase(documentTypeRepository, auditRepository, infra.unitOfWork);
  const deleteDocumentTypeUseCase = new DeleteDocumentTypeUseCase(documentTypeRepository, auditRepository, infra.unitOfWork);

  return new DocumentTypeController({
    listActiveDocumentTypesUseCase,
    listAllDocumentTypesUseCase,
    createDocumentTypeUseCase,
    updateDocumentTypeUseCase,
    deleteDocumentTypeUseCase,
  });
}
