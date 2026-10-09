import type { IUnitOfWork } from '../../contracts/unit-of-work.contract.js';
import type {
  ITicketRepository,
  ITicketMessageRepository,
  TicketMessageEntity,
} from '../../../domain/repositories/ticket.repository.interface.js';
import type { IAuditRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { INotificationRepository } from '../../../domain/repositories/notification.repository.interface.js';
import { NotFoundError, ForbiddenError, BusinessRuleError } from '../../../domain/errors/index.js';

export interface ReplyTicketInput {
  ticketId: string;
  content: string;
}

export class ReplyTicketUseCase {
  constructor(
    private readonly ticketRepository: ITicketRepository,
    private readonly ticketMessageRepository: ITicketMessageRepository,
    private readonly auditRepository: IAuditRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    input: ReplyTicketInput,
    context: {
      actorId: string;
      actorType: 'client' | 'user';
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<TicketMessageEntity> {
    const ticket = await this.ticketRepository.findById(input.ticketId);
    if (!ticket) {
      throw new NotFoundError('Ticket', input.ticketId);
    }

    if (context.actorType === 'client' && ticket.clientId !== context.actorId) {
      throw new ForbiddenError('Acesso não autorizado a este ticket.');
    }

    if (ticket.status === 'CLOSED') {
      throw new BusinessRuleError('Não é possível responder a um ticket encerrado.');
    }

    return this.unitOfWork.run(async () => {
      const message = await this.ticketMessageRepository.create({
        ticketId: input.ticketId,
        senderId: context.actorId,
        senderType: context.actorType === 'client' ? 'CLIENT' : 'USER',
        content: input.content,
      });

      if (context.actorType === 'user') {
        await this.notificationRepository.create({
          recipientId: ticket.clientId,
          recipientType: 'CLIENT',
          type: 'TICKET_REPLIED',
          title: `Nova resposta no ticket: ${ticket.subject}`,
          body: message.content.slice(0, 200),
          metadata: { ticketId: ticket.id, messageId: message.id },
        });
      }

      await this.auditRepository.log({
        ...(context.actorType === 'client'
          ? { clientId: context.actorId }
          : { userId: context.actorId }),
        action: 'TICKET_REPLIED',
        entity: 'Ticket',
        entityId: ticket.id,
        newValues: { messageId: message.id },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });

      return message;
    });
  }
}
