// ============================================================
// Ticket types
// ============================================================

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'AWAITING_CLIENT'
  | 'RESOLVED'
  | 'CLOSED';

export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface TicketDTO {
  id: string;
  clientId: string;
  subject: string;
  category: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketDTO {
  subject: string;
  category: string;
  description: string;
  priority?: TicketPriority;
}

export interface TicketMessageDTO {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'CLIENT' | 'USER' | 'SYSTEM';
  senderName: string;
  content: string;
  createdAt: string;
}

export interface SendTicketMessageDTO {
  ticketId: string;
  content: string;
}
