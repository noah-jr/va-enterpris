import type { IUnitOfWork } from '../../contracts/unit-of-work.contract.js';
import type { IDocumentTypeRepository } from '../../../domain/repositories/document-type.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import { NotFoundError } from '../../../domain/errors/index.js';

export class DeleteDocumentTypeUseCase {
  constructor(
    private readonly repository: IDocumentTypeRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    id: string,
    context?: { userId?: string; ipAddress?: string; userAgent?: string },
  ): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('DocumentType', id);
    }

    return this.unitOfWork.run(async () => {
      await this.repository.softDelete(id);

      await this.auditRepository.log({
        userId: context?.userId,
        action: 'DOCUMENT_TYPE_DELETED',
        entity: 'DocumentType',
        entityId: id,
        metadata: { code: existing.code, name: existing.name },
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      });
    });
  }
}
