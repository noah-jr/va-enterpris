import type {
  IDocumentRepository,
  IDocumentFileRepository,
  IDocumentStatusHistoryRepository,
  DocumentEntity,
  DocumentFileEntity,
} from '../../../domain/repositories/document.repository.interface.js';
import type {
  IClientUploadSessionRepository,
} from '../../../domain/repositories/client-upload-session.repository.interface.js';
import type { IClientRepository } from '../../../domain/repositories/client.repository.interface.js';
import type { IFileStorage } from '../../contracts/file-storage.contract.js';
import type { ITokenService, IUnitOfWork } from '../../contracts/index.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import {
  storeDocumentFile,
  validateDocumentFile,
  DEFAULT_MAX_FILE_SIZE_BYTES,
} from '../documents/store-document-file.helper.js';
import { invalidSessionError, isUploadSessionUsable } from './upload-session-url.js';

export interface UploadDocumentViaSessionInput {
  token: string;
  title?: string;
  description?: string;
  type?: string;
  originalName: string;
  mimeType: string;
  buffer: Buffer;
  size: number;
}

export interface UploadDocumentViaSessionResult {
  document: DocumentEntity;
  file: DocumentFileEntity;
}

export class UploadDocumentViaSessionUseCase {
  constructor(
    private readonly clientUploadSessionRepository: IClientUploadSessionRepository,
    private readonly clientRepository: IClientRepository,
    private readonly documentRepository: IDocumentRepository,
    private readonly documentFileRepository: IDocumentFileRepository,
    private readonly statusHistoryRepository: IDocumentStatusHistoryRepository,
    private readonly fileStorage: IFileStorage,
    private readonly auditRepository: IAuditRepository,
    private readonly tokenService: ITokenService,
    private readonly unitOfWork: IUnitOfWork,
    private readonly bucketName: string,
    private readonly maxFileSizeBytes: number = DEFAULT_MAX_FILE_SIZE_BYTES,
  ) {}

  async execute(
    input: UploadDocumentViaSessionInput,
    context: { ipAddress?: string; userAgent?: string },
  ): Promise<UploadDocumentViaSessionResult> {
    if (!input.token) {
      throw invalidSessionError();
    }

    const session = await this.clientUploadSessionRepository.findByTokenHash(
      this.tokenService.hashToken(input.token),
    );
    if (!session || !isUploadSessionUsable(session)) {
      throw invalidSessionError();
    }

    const client = await this.clientRepository.findById(session.clientId);
    if (!client || !client.isActive) {
      throw invalidSessionError();
    }

    // Valida o ficheiro ANTES de criar o documento — um ficheiro inválido não deixa
    // documentos órfãos para trás.
    validateDocumentFile(input, this.maxFileSizeBytes);

    const title = input.title?.trim() || input.originalName;
    const documentType = input.type?.trim() || 'OUTROS';

    return this.unitOfWork.run(async () => {
      const document = await this.documentRepository.create({
        clientId: session.clientId,
        uploadSessionId: session.id,
        title,
        description: input.description?.trim() || undefined,
        type: documentType,
        priority: 'NORMAL',
        status: 'SUBMITTED',
      });

      await this.statusHistoryRepository.create({
        documentId: document.id,
        fromStatus: null,
        toStatus: 'SUBMITTED',
        note: 'Documento submetido via portal público de envio',
      });

      const { fileEntity, checksum } = await storeDocumentFile(
        {
          document,
          originalName: input.originalName,
          mimeType: input.mimeType,
          buffer: input.buffer,
          size: input.size,
          uploadedById: session.clientId,
          uploaderType: 'CLIENT',
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
        clientId: session.clientId,
        action: 'DOCUMENT_CREATED_VIA_PUBLIC_SESSION',
        entity: 'Document',
        entityId: document.id,
        newValues: {
          documentId: document.id,
          fileId: fileEntity.id,
          sessionId: session.id,
          originalName: input.originalName,
          size: input.size,
          mimeType: fileEntity.mimeType,
          checksum,
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return { document, file: fileEntity };
    });
  }
}
