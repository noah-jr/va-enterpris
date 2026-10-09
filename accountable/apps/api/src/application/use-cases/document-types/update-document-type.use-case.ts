import type { IUnitOfWork } from '../../contracts/unit-of-work.contract.js';
import type { IDocumentTypeRepository } from '../../../domain/repositories/document-type.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { UpdateDocumentTypeDTO, DocumentTypeDTO } from '@accountable/types';
import { NotFoundError, ConflictError } from '../../../domain/errors/index.js';
import { toDocumentTypeDTO } from './document-type.mapper.js';

export class UpdateDocumentTypeUseCase {
  constructor(
    private readonly repository: IDocumentTypeRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    id: string,
    input: UpdateDocumentTypeDTO,
    context?: { userId?: string; ipAddress?: string; userAgent?: string },
  ): Promise<DocumentTypeDTO> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('DocumentType', id);
    }

    if (input.code && input.code !== existing.code) {
      const duplicate = await this.repository.findByCode(input.code);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError(`Já existe um tipo de documento com o código '${input.code}'.`);
      }
    }

    return this.unitOfWork.run(async () => {
      const updated = await this.repository.update(id, input);

      await this.auditRepository.log({
        userId: context?.userId,
        action: 'DOCUMENT_TYPE_UPDATED',
        entity: 'DocumentType',
        entityId: updated.id,
        metadata: { code: updated.code, changes: input },
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      });

      return toDocumentTypeDTO(updated);
    });
  }
}
