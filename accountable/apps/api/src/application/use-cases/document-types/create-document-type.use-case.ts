import type { IUnitOfWork } from '../../contracts/unit-of-work.contract.js';
import type { IDocumentTypeRepository } from '../../../domain/repositories/document-type.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { CreateDocumentTypeDTO, DocumentTypeDTO } from '@accountable/types';
import { ConflictError } from '../../../domain/errors/index.js';
import { toDocumentTypeDTO } from './document-type.mapper.js';

export class CreateDocumentTypeUseCase {
  constructor(
    private readonly repository: IDocumentTypeRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    input: CreateDocumentTypeDTO,
    context?: { userId?: string; ipAddress?: string; userAgent?: string },
  ): Promise<DocumentTypeDTO> {
    const existing = await this.repository.findByCode(input.code);
    if (existing) {
      throw new ConflictError(`Já existe um tipo de documento com o código '${input.code}'.`);
    }

    return this.unitOfWork.run(async () => {
      const created = await this.repository.create(input);

      await this.auditRepository.log({
        userId: context?.userId,
        action: 'DOCUMENT_TYPE_CREATED',
        entity: 'DocumentType',
        entityId: created.id,
        metadata: { code: created.code, name: created.name },
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      });

      return toDocumentTypeDTO(created);
    });
  }
}
