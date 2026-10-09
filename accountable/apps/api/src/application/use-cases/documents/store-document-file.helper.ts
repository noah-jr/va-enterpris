import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import type {
  DocumentEntity,
  DocumentFileEntity,
  IDocumentFileRepository,
} from '../../../domain/repositories/document.repository.interface.js';
import type { IFileStorage } from '../../contracts/file-storage.contract.js';
import type { IUnitOfWork } from '../../contracts/unit-of-work.contract.js';
import { ValidationError, BusinessRuleError } from '../../../domain/errors/index.js';
import { contentMatchesMimeType } from './file-signature.js';

// Mapeamento estrito de MIME types permitidos para extensões permitidas
export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
};

export const TERMINAL_DOCUMENT_STATUSES = ['COMPLETED', 'ARCHIVED', 'CANCELLED', 'REJECTED'];

export const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface DocumentFileCandidate {
  originalName: string;
  mimeType: string;
  buffer: Buffer;
  size: number;
}

export interface StoreDocumentFileInput extends DocumentFileCandidate {
  document: DocumentEntity;
  uploadedById: string;
  uploaderType: 'CLIENT' | 'USER';
}

export function assertDocumentAcceptsUploads(document: DocumentEntity): void {
  if (TERMINAL_DOCUMENT_STATUSES.includes(document.status)) {
    throw new BusinessRuleError(
      'Não é possível adicionar ficheiros a um documento concluído ou arquivado.',
    );
  }
}

/**
 * Valida tamanho, MIME/extensão e o conteúdo real do ficheiro. Não tem efeitos
 * secundários — deve ser chamada ANTES de criar qualquer registo.
 */
export function validateDocumentFile(
  file: DocumentFileCandidate,
  maxFileSizeBytes: number = DEFAULT_MAX_FILE_SIZE_BYTES,
): { normalizedMime: string; ext: string } {
  if (file.size <= 0 || file.buffer.length === 0) {
    throw new ValidationError('O ficheiro enviado está vazio.');
  }

  if (file.size > maxFileSizeBytes) {
    throw new ValidationError(
      `O ficheiro excede o tamanho máximo permitido de ${Math.round(maxFileSizeBytes / 1024 / 1024)}MB.`,
    );
  }

  const normalizedMime = file.mimeType.toLowerCase();
  const ext = path.extname(file.originalName).toLowerCase();

  const allowedExtensions = ALLOWED_MIME_TYPES[normalizedMime];
  if (!allowedExtensions || !allowedExtensions.includes(ext)) {
    throw new ValidationError(
      'Tipo de ficheiro ou extensão não permitidos. Formatos aceites: PDF, DOCX, XLSX, JPG, PNG, CSV, TXT.',
    );
  }

  if (!contentMatchesMimeType(file.buffer, normalizedMime)) {
    throw new ValidationError(
      'O conteúdo do ficheiro não corresponde ao tipo declarado. Verifique se o ficheiro não está corrompido.',
    );
  }

  return { normalizedMime, ext };
}

/**
 * Envia o ficheiro para o storage e cria o registo. Tem de correr dentro de
 * `unitOfWork.run()`: se a transação fizer rollback, o objeto enviado é apagado.
 */
export async function storeDocumentFile(
  params: StoreDocumentFileInput,
  deps: {
    documentFileRepository: IDocumentFileRepository;
    fileStorage: IFileStorage;
    unitOfWork: IUnitOfWork;
    bucketName: string;
    maxFileSizeBytes?: number;
  },
): Promise<{ fileEntity: DocumentFileEntity; checksum: string }> {
  const { normalizedMime, ext } = validateDocumentFile(params, deps.maxFileSizeBytes);

  const checksum = createHash('sha256').update(params.buffer).digest('hex');

  const storageName = `${randomUUID()}${ext}`;
  const objectPath = `documents/${params.document.id}/${storageName}`;

  await deps.fileStorage.ensureBucketExists(deps.bucketName);
  const uploadResult = await deps.fileStorage.upload({
    bucketName: deps.bucketName,
    objectName: objectPath,
    buffer: params.buffer,
    size: params.size,
    mimeType: normalizedMime,
    metadata: {
      originalName: encodeURIComponent(params.originalName),
      documentId: params.document.id,
      uploadedBy: params.uploadedById,
    },
  });

  deps.unitOfWork.onRollback(() => deps.fileStorage.delete(deps.bucketName, objectPath));

  const fileEntity = await deps.documentFileRepository.create({
    documentId: params.document.id,
    originalName: params.originalName,
    storageName,
    mimeType: normalizedMime,
    size: params.size,
    checksum,
    storagePath: uploadResult.storagePath,
    uploadedById: params.uploadedById,
    uploaderType: params.uploaderType,
  });

  return { fileEntity, checksum };
}
