import { api } from '../lib/axios.js';
import type { PaginatedResponse } from '@accountable/types';

export interface NotificationItem {
  id: string;
  recipientId: string;
  recipientType: 'CLIENT' | 'USER';
  type: string;
  title: string;
  body: string;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

export const notificationService = {
  async list(page = 1, perPage = 20): Promise<PaginatedResponse<NotificationItem>> {
    const res = await api.get<PaginatedResponse<NotificationItem>>('/notifications', {
      params: { page, perPage },
    });
    return res.data;
  },

  async markRead(id: string): Promise<NotificationItem> {
    const res = await api.patch<{ data: NotificationItem }>(`/notifications/${id}/read`);
    return res.data.data;
  },
};
