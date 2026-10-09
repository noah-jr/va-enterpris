import { api } from '../lib/axios.js';
import type { PaginatedResponse, SenderType } from '@accountable/types';
import type { SendMessageInput } from '@accountable/schemas';

export interface MessageItem {
  id: string;
  documentId: string;
  senderId: string;
  senderType: SenderType;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export const messageService = {
  async list(documentId: string, page = 1, perPage = 50): Promise<PaginatedResponse<MessageItem>> {
    const res = await api.get<PaginatedResponse<MessageItem>>(`/documents/${documentId}/messages`, {
      params: { page, perPage },
    });
    return res.data;
  },

  async send(documentId: string, data: SendMessageInput): Promise<MessageItem> {
    const res = await api.post<{ data: MessageItem }>(`/documents/${documentId}/messages`, data);
    return res.data.data;
  },
};
