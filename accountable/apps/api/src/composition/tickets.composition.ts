import {
  CreateTicketUseCase,
  ListTicketsUseCase,
  GetTicketUseCase,
  ReplyTicketUseCase,
  UpdateTicketStatusUseCase,
} from '../application/use-cases/tickets/index.js';
import { TicketController } from '../presentation/controllers/ticket.controller.js';
import type { Infrastructure } from './infrastructure.js';

export function buildTicketController(infra: Infrastructure): TicketController {
  const { ticketRepository, ticketMessageRepository, auditRepository, notificationRepository } =
    infra.repositories;

  const createTicketUseCase = new CreateTicketUseCase(ticketRepository, auditRepository, infra.unitOfWork);
  const listTicketsUseCase = new ListTicketsUseCase(ticketRepository);
  const getTicketUseCase = new GetTicketUseCase(ticketRepository, ticketMessageRepository);
  const replyTicketUseCase = new ReplyTicketUseCase(
    ticketRepository,
    ticketMessageRepository,
    auditRepository,
    notificationRepository,
    infra.unitOfWork,
  );
  const updateTicketStatusUseCase = new UpdateTicketStatusUseCase(ticketRepository, auditRepository, infra.unitOfWork);

  return new TicketController({
    createTicketUseCase,
    listTicketsUseCase,
    getTicketUseCase,
    replyTicketUseCase,
    updateTicketStatusUseCase,
  });
}
