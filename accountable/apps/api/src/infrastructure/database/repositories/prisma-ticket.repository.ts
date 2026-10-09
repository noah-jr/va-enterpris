import type { PrismaClient } from '@prisma/client';
import type { TicketStatus, TicketPriority } from '@accountable/types';
import type {
  ITicketRepository,
  TicketEntity,
  CreateTicketData,
  ITicketMessageRepository,
  TicketMessageEntity,
  CreateTicketMessageData,
} from '../../../domain/repositories/ticket.repository.interface.js';

export class PrismaTicketRepository implements ITicketRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateTicketData): Promise<TicketEntity> {
    const ticket = await this.prisma.ticket.create({
      data: {
        clientId: data.clientId,
        subject: data.subject,
        category: data.category,
        description: data.description,
        priority: data.priority,
        status: 'OPEN',
      },
    });
    return ticket;
  }

  async findById(id: string): Promise<TicketEntity | null> {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    return ticket;
  }

  async updateStatus(id: string, status: TicketStatus): Promise<TicketEntity> {
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: { status },
    });
    return ticket;
  }

  async list(params: {
    page: number;
    perPage: number;
    clientId?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
  }): Promise<{ items: TicketEntity[]; total: number }> {
    const { page, perPage, clientId, status, priority } = params;
    const skip = (page - 1) * perPage;

    const where = {
      ...(clientId ? { clientId } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return { items, total };
  }
}

export class PrismaTicketMessageRepository implements ITicketMessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateTicketMessageData): Promise<TicketMessageEntity> {
    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId: data.ticketId,
        senderId: data.senderId,
        senderType: data.senderType,
        content: data.content,
      },
    });
    return message;
  }

  async findByTicketId(ticketId: string): Promise<TicketMessageEntity[]> {
    const messages = await this.prisma.ticketMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
    });
    return messages;
  }
}
