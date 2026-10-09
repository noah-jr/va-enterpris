import type {
  IDocumentRepository,
  IDocumentFileRepository,
  DocumentFileEntity,
} from '../../../domain/repositories/document.repository.interface.js';
import type { IDocumentUploadLinkRepository } from '../../../domain/repositories/document-upload-link.repository.interface.js';
import type { IFileStorage } from '../../contracts/file-storage.contract.js';
import type { ITokenService, IUnitOfWork } from '../../contracts/index.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import { NotFoundError } from '../../../domain/errors/index.js';
import {
  assertDocumentAcceptsUploads,
  storeDocumentFile,
  validateDocumentFile,
} from '../documents/store-document-file.helper.js';

function invalidLinkError(): NotFoundError {
  const error = new NotFoundError('Link');
  Object.defineProperty(error, 'message', { value: 'Link inválido ou expirado', writable: false });
  return error;
}

export interface UploadViaPublicLinkInput {
  token: string;
  originalName: string;
  mimeType: string;
  buffer: Buffer;
  size: number;
}

export class UploadViaPublicLinkUseCase {
  constructor(
    private readonly documentUploadLinkRepository: IDocumentUploadLinkRepository,
    private readonly documentRepository: IDocumentRepository,
    private readonly documentFileRepository: IDocumentFileRepository,
    private readonly fileStorage: IFileStorage,
    private readonly auditRepository: IAuditRepository,
    private readonly tokenService: ITokenService,
    private readonly unitOfWork: IUnitOfWork,
    private readonly bucketName: string,
  ) {}

  async execute(
    input: UploadViaPublicLinkInput,
    context: { ipAddress?: string; userAgent?: string },
  ): Promise<DocumentFileEntity> {
    const link = await this.documentUploadLinkRepository.findByTokenHash(
      this.tokenService.hashToken(input.token),
    );
    if (!link || link.revokedAt || link.expiresAt.getTime() < Date.now()) {
      throw invalidLinkError();
    }

    const document = await this.documentRepository.findById(link.documentId);
    if (!document) {
      throw invalidLinkError();
    }

    assertDocumentAcceptsUploads(document);

    validateDocumentFile(input);

    return this.unitOfWork.run(async () => {
      const { fileEntity, checksum } = await storeDocumentFile(
        {
          document,
          originalName: input.originalName,
          mimeType: input.mimeType,
          buffer: input.buffer,
          size: input.size,
          uploadedById: document.clientId,
          uploaderType: 'CLIENT',
        },
        {
          documentFileRepository: this.documentFileRepository,
          fileStorage: this.fileStorage,
          unitOfWork: this.unitOfWork,
          bucketName: this.bucketName,
        },
      );

      await this.auditRepository.log({
        clientId: document.clientId,
        action: 'DOCUMENT_FILE_UPLOADED_VIA_LINK',
        entity: 'DocumentFile',
        entityId: fileEntity.id,
        newValues: {
          documentId: document.id,
          originalName: input.originalName,
          size: input.size,
          mimeType: fileEntity.mimeType,
          checksum,
          uploadLinkId: link.id,
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return fileEntity;
    });
  }
}
