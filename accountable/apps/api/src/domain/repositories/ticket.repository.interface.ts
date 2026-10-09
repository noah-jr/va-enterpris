import type { SenderType, TicketStatus, TicketPriority } from '@accountable/types';

export interface TicketEntity {
  id: string;
  clientId: string;
  subject: string;
  category: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateTicketData {
  clientId: string;
  subject: string;
  category: string;
  description: string;
  priority: TicketPriority;
}

export interface ITicketRepository {
  create(data: CreateTicketData): Promise<TicketEntity>;
  findById(id: string): Promise<TicketEntity | null>;
  updateStatus(id: string, status: TicketStatus): Promise<TicketEntity>;
  list(params: {
    page: number;
    perPage: number;
    clientId?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
  }): Promise<{ items: TicketEntity[]; total: number }>;
}

export interface TicketMessageEntity {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: SenderType;
  content: string;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface CreateTicketMessageData {
  ticketId: string;
  senderId: string;
  senderType: SenderType;
  content: string;
}

export interface ITicketMessageRepository {
  create(data: CreateTicketMessageData): Promise<TicketMessageEntity>;
  findByTicketId(ticketId: string): Promise<TicketMessageEntity[]>;
}
