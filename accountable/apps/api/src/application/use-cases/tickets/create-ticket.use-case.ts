import type { IUnitOfWork } from '../../contracts/unit-of-work.contract.js';
import type { TicketPriority } from '@accountable/types';
import type {
  ITicketRepository,
  TicketEntity,
} from '../../../domain/repositories/ticket.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';

export interface CreateTicketInput {
  clientId: string;
  subject: string;
  category: string;
  description: string;
  priority?: TicketPriority;
}

export class CreateTicketUseCase {
  constructor(
    private readonly ticketRepository: ITicketRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    input: CreateTicketInput,
    context: { actorId: string; ipAddress?: string; userAgent?: string },
  ): Promise<TicketEntity> {
    return this.unitOfWork.run(async () => {
      const ticket = await this.ticketRepository.create({
        clientId: input.clientId,
        subject: input.subject,
        category: input.category,
        description: input.description,
        priority: input.priority ?? 'NORMAL',
      });

      await this.auditRepository.log({
        clientId: context.actorId,
        action: 'TICKET_CREATED',
        entity: 'Ticket',
        entityId: ticket.id,
        newValues: { subject: ticket.subject, category: ticket.category, priority: ticket.priority },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return ticket;
    });
  }
}
