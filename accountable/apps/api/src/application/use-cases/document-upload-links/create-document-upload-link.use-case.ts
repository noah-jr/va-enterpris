import type { IDocumentRepository } from '../../../domain/repositories/document.repository.interface.js';
import type {
  IDocumentUploadLinkRepository,
  DocumentUploadLinkEntity,
} from '../../../domain/repositories/document-upload-link.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import { NotFoundError } from '../../../domain/errors/index.js';
import type { ITokenService, IUnitOfWork } from '../../contracts/index.js';

const DEFAULT_EXPIRES_IN_HOURS = 72;
const MAX_EXPIRES_IN_HOURS = 720; // 30 dias

export interface CreateDocumentUploadLinkInput {
  documentId: string;
  expiresInHours?: number;
}

export class CreateDocumentUploadLinkUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly documentUploadLinkRepository: IDocumentUploadLinkRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly tokenService: ITokenService,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    input: CreateDocumentUploadLinkInput,
    context: { actorId: string; ipAddress?: string; userAgent?: string },
  ): Promise<DocumentUploadLinkEntity & { token: string }> {
    const document = await this.documentRepository.findById(input.documentId);
    if (!document) {
      throw new NotFoundError('Documento', input.documentId);
    }

    const expiresInHours = Math.min(
      input.expiresInHours ?? DEFAULT_EXPIRES_IN_HOURS,
      MAX_EXPIRES_IN_HOURS,
    );

    const token = this.tokenService.generateSecureToken();
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

    const link = await this.unitOfWork.run(async () => {
      const created = await this.documentUploadLinkRepository.create({
        documentId: document.id,
        tokenHash: this.tokenService.hashToken(token),
        createdByUserId: context.actorId,
        expiresAt,
      });

      await this.auditRepository.log({
        userId: context.actorId,
        action: 'DOCUMENT_UPLOAD_LINK_CREATED',
        entity: 'DocumentUploadLink',
        entityId: created.id,
        newValues: {
          documentId: document.id,
          expiresAt: expiresAt.toISOString(),
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return created;
    });

    // O token em claro só existe nesta resposta — na base de dados fica apenas o hash.
    return { ...link, token };
  }
}
