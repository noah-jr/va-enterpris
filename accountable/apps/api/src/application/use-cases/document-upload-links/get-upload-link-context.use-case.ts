import type {
  IDocumentRepository,
  IDocumentFileRepository,
} from '../../../domain/repositories/document.repository.interface.js';
import type { IDocumentUploadLinkRepository } from '../../../domain/repositories/document-upload-link.repository.interface.js';
import { NotFoundError } from '../../../domain/errors/index.js';
import type { ITokenService } from '../../contracts/index.js';

function invalidLinkError(): NotFoundError {
  const error = new NotFoundError('Link');
  Object.defineProperty(error, 'message', { value: 'Link inválido ou expirado', writable: false });
  return error;
}

export interface UploadLinkContextOutput {
  documentTitle: string;
  documentType: string;
  documentStatus: string;
  clientName: string;
  existingFiles: Array<{ originalName: string; createdAt: Date }>;
}

export class GetUploadLinkContextUseCase {
  constructor(
    private readonly documentUploadLinkRepository: IDocumentUploadLinkRepository,
    private readonly documentRepository: IDocumentRepository,
    private readonly documentFileRepository: IDocumentFileRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(token: string): Promise<UploadLinkContextOutput> {
    const link = await this.documentUploadLinkRepository.findByTokenHash(
      this.tokenService.hashToken(token),
    );
    if (!link || link.revokedAt || link.expiresAt.getTime() < Date.now()) {
      throw invalidLinkError();
    }

    const document = await this.documentRepository.findByIdWithRelations(link.documentId);
    if (!document) {
      throw invalidLinkError();
    }

    const files = await this.documentFileRepository.findByDocumentId(document.id);

    return {
      documentTitle: document.title,
      documentType: document.type,
      documentStatus: document.status,
      clientName: document.client.name,
      existingFiles: files.map((file) => ({
        originalName: file.originalName,
        createdAt: file.createdAt,
      })),
    };
  }
}
