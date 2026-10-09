import type { PaginatedResponse, TicketStatus, TicketPriority } from '@accountable/types';
import type {
  ITicketRepository,
  TicketEntity,
} from '../../../domain/repositories/ticket.repository.interface.js';

export interface ListTicketsInput {
  page?: number;
  perPage?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  clientId?: string;
}

export class ListTicketsUseCase {
  constructor(private readonly ticketRepository: ITicketRepository) {}

  async execute(
    input: ListTicketsInput,
    context: { actorId: string; actorType: 'client' | 'user' },
  ): Promise<PaginatedResponse<TicketEntity>> {
    const page = Math.max(1, input.page ?? 1);
    const perPage = Math.min(100, Math.max(1, input.perPage ?? 20));

    const effectiveClientId = context.actorType === 'client' ? context.actorId : input.clientId;

    const { items, total } = await this.ticketRepository.list({
      page,
      perPage,
      status: input.status,
      priority: input.priority,
      clientId: effectiveClientId,
    });

    return {
      data: items,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }
}
