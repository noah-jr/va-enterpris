import { api } from '../lib/axios.js';
import type { PaginatedResponse, TicketDTO } from '@accountable/types';
import type { CreateTicketInput, SendTicketMessageInput, TicketFilterInput } from '@accountable/schemas';

export interface TicketMessageItem {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'CLIENT' | 'USER' | 'SYSTEM';
  content: string;
  createdAt: string;
}

export interface TicketDetails {
  ticket: TicketDTO;
  messages: TicketMessageItem[];
}

export const ticketService = {
  async list(params?: Partial<TicketFilterInput>): Promise<PaginatedResponse<TicketDTO>> {
    const res = await api.get<PaginatedResponse<TicketDTO>>('/tickets', { params });
    return res.data;
  },

  async getById(id: string): Promise<TicketDetails> {
    const res = await api.get<{ data: TicketDetails }>(`/tickets/${id}`);
    return res.data.data;
  },

  async create(data: CreateTicketInput): Promise<TicketDTO> {
    const res = await api.post<{ data: TicketDTO }>('/tickets', data);
    return res.data.data;
  },

  async reply(id: string, data: SendTicketMessageInput): Promise<TicketMessageItem> {
    const res = await api.post<{ data: TicketMessageItem }>(`/tickets/${id}/messages`, data);
    return res.data.data;
  },
};
