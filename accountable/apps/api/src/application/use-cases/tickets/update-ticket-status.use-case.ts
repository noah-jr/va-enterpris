import type { IUnitOfWork } from '../../contracts/unit-of-work.contract.js';
import type { TicketStatus } from '@accountable/types';
import type {
  ITicketRepository,
  TicketEntity,
} from '../../../domain/repositories/ticket.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import { NotFoundError, BusinessRuleError } from '../../../domain/errors/index.js';

const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ['IN_PROGRESS', 'CLOSED'],
  IN_PROGRESS: ['AWAITING_CLIENT', 'RESOLVED', 'CLOSED'],
  AWAITING_CLIENT: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
};

export interface UpdateTicketStatusInput {
  ticketId: string;
  toStatus: TicketStatus;
}

export class UpdateTicketStatusUseCase {
  constructor(
    private readonly ticketRepository: ITicketRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    input: UpdateTicketStatusInput,
    context: { actorId: string; ipAddress?: string; userAgent?: string },
  ): Promise<TicketEntity> {
    const ticket = await this.ticketRepository.findById(input.ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket', input.ticketId);
    }

    const allowedNext = ALLOWED_TRANSITIONS[ticket.status] ?? [];
    if (!allowedNext.includes(input.toStatus)) {
      throw new BusinessRuleError(
        `Transição de estado inválida: não é permitido alterar de '${ticket.status}' para '${input.toStatus}'.`,
      );
    }

    return this.unitOfWork.run(async () => {
      const updated = await this.ticketRepository.updateStatus(ticket.id, input.toStatus);

      await this.auditRepository.log({
        userId: context.actorId,
        action: 'TICKET_STATUS_CHANGED',
        entity: 'Ticket',
        entityId: ticket.id,
        oldValues: { status: ticket.status },
        newValues: { status: input.toStatus },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return updated;
    });
  }
}
