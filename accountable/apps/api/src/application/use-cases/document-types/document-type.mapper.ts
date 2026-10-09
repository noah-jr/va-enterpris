import type { DocumentTypeEntity } from '../../../domain/repositories/document-type.repository.interface.js';
import type { DocumentTypeDTO } from '@accountable/types';

export function toDocumentTypeDTO(docType: DocumentTypeEntity): DocumentTypeDTO {
  return {
    id: docType.id,
    code: docType.code,
    name: docType.name,
    description: docType.description,
    category: docType.category,
    required: docType.required,
    isActive: docType.isActive,
    sortOrder: docType.sortOrder,
    allowedExtensions: docType.allowedExtensions,
    createdAt: docType.createdAt.toISOString(),
    updatedAt: docType.updatedAt.toISOString(),
  };
}
