import type { IDocumentUploadLinkRepository } from '../../../domain/repositories/document-upload-link.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import { NotFoundError } from '../../../domain/errors/index.js';
import type { IUnitOfWork } from '../../contracts/index.js';

export interface RevokeDocumentUploadLinkInput {
  linkId: string;
  documentId: string;
}

export class RevokeDocumentUploadLinkUseCase {
  constructor(
    private readonly documentUploadLinkRepository: IDocumentUploadLinkRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    input: RevokeDocumentUploadLinkInput,
    context: { actorId: string; ipAddress?: string; userAgent?: string },
  ): Promise<void> {
    const link = await this.documentUploadLinkRepository.findById(input.linkId);
    if (!link || link.documentId !== input.documentId) {
      throw new NotFoundError('Link de envio', input.linkId);
    }

    await this.unitOfWork.run(async () => {
      await this.documentUploadLinkRepository.revoke(link.id);

      await this.auditRepository.log({
        userId: context.actorId,
        action: 'DOCUMENT_UPLOAD_LINK_REVOKED',
        entity: 'DocumentUploadLink',
        entityId: link.id,
        newValues: { documentId: link.documentId },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    });
  }
}
