import type { IUnitOfWork } from '../../contracts/unit-of-work.contract.js';
import type { IContactRequestRepository } from '../../../domain/repositories/contact.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { ContactRequestDTO } from '@accountable/types';
import type { SubmitContactInput } from '@accountable/schemas';
import { toContactRequestDTO } from './contact.mapper.js';

export class SubmitContactRequestUseCase {
  constructor(
    private readonly contactRequestRepository: IContactRequestRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    input: SubmitContactInput,
    context: { ipAddress?: string; userAgent?: string },
  ): Promise<ContactRequestDTO> {
    return this.unitOfWork.run(async () => {
      const request = await this.contactRequestRepository.create({
        name: input.name,
        email: input.email,
        company: input.company ?? null,
        phone: input.phone ?? null,
        message: input.message,
      });

      await this.auditRepository.log({
        action: 'CONTACT_REQUEST_SUBMITTED',
        entity: 'ContactRequest',
        entityId: request.id,
        newValues: { name: request.name, email: request.email },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return toContactRequestDTO(request);
    });
  }
}
