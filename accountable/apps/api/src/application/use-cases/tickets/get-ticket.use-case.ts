import type {
  ITicketRepository,
  ITicketMessageRepository,
  TicketEntity,
  TicketMessageEntity,
} from '../../../domain/repositories/ticket.repository.interface.js';
import { NotFoundError, ForbiddenError } from '../../../domain/errors/index.js';

export interface TicketDetailsOutput {
  ticket: TicketEntity;
  messages: TicketMessageEntity[];
}

export class GetTicketUseCase {
  constructor(
    private readonly ticketRepository: ITicketRepository,
    private readonly ticketMessageRepository: ITicketMessageRepository,
  ) {}

  async execute(
    ticketId: string,
    context: { actorId: string; actorType: 'client' | 'user' },
  ): Promise<TicketDetailsOutput> {
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
    }

    if (context.actorType === 'client' && ticket.clientId !== context.actorId) {
      throw new ForbiddenError('Acesso não autorizado a este ticket.');
    }

    const messages = await this.ticketMessageRepository.findByTicketId(ticketId);

    return { ticket, messages };
  }
}
