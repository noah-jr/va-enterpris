import type {
  IDocumentRepository,
  IDocumentFileRepository,
  DocumentFileEntity,
} from '../../../domain/repositories/document.repository.interface.js';
import type { IFileStorage } from '../../contracts/file-storage.contract.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import { NotFoundError, ForbiddenError } from '../../../domain/errors/index.js';
import {
  assertDocumentAcceptsUploads,
  storeDocumentFile,
  validateDocumentFile,
  DEFAULT_MAX_FILE_SIZE_BYTES,
} from './store-document-file.helper.js';
import type { IUnitOfWork } from '../../contracts/unit-of-work.contract.js';

export interface UploadDocumentFileInput {
  documentId: string;
  originalName: string;
  mimeType: string;
  buffer: Buffer;
  size: number;
}

export class UploadDocumentFileUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly documentFileRepository: IDocumentFileRepository,
    private readonly fileStorage: IFileStorage,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly bucketName: string,
    private readonly maxFileSizeBytes: number = DEFAULT_MAX_FILE_SIZE_BYTES,
  ) {}

  async execute(
    input: UploadDocumentFileInput,
    context: {
      actorId: string;
      actorType: 'client' | 'user';
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<DocumentFileEntity> {
    const document = await this.documentRepository.findById(input.documentId);
    if (!document) {
      throw new NotFoundError('Documento', input.documentId);
    }

    if (context.actorType === 'client' && document.clientId !== context.actorId) {
      throw new ForbiddenError('Não tem permissão para anexar ficheiros a este documento.');
    }

    assertDocumentAcceptsUploads(document);
    validateDocumentFile(input, this.maxFileSizeBytes);

    return this.unitOfWork.run(async () => {
      const { fileEntity, checksum } = await storeDocumentFile(
        {
          document,
          originalName: input.originalName,
          mimeType: input.mimeType,
          buffer: input.buffer,
          size: input.size,
          uploadedById: context.actorId,
          uploaderType: context.actorType === 'client' ? 'CLIENT' : 'USER',
        },
        {
          documentFileRepository: this.documentFileRepository,
          fileStorage: this.fileStorage,
          unitOfWork: this.unitOfWork,
          bucketName: this.bucketName,
          maxFileSizeBytes: this.maxFileSizeBytes,
        },
      );

      await this.auditRepository.log({
        ...(context.actorType === 'client'
          ? { clientId: context.actorId }
          : { userId: context.actorId }),
        action: 'FILE_UPLOADED',
        entity: 'DocumentFile',
        entityId: fileEntity.id,
        newValues: {
          documentId: document.id,
          originalName: input.originalName,
          size: input.size,
          mimeType: fileEntity.mimeType,
          checksum,
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return fileEntity;
    });
  }
}
