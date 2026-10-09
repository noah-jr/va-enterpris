export type NotificationRecipientType = 'CLIENT' | 'USER';

export interface NotificationEntity {
  id: string;
  recipientId: string;
  recipientType: NotificationRecipientType;
  type: string;
  title: string;
  body: string;
  metadata: Record<string, unknown> | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface CreateNotificationData {
  recipientId: string;
  recipientType: NotificationRecipientType;
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface INotificationRepository {
  create(data: CreateNotificationData): Promise<NotificationEntity>;
  findById(id: string): Promise<NotificationEntity | null>;
  markRead(id: string): Promise<NotificationEntity>;
  listForRecipient(params: {
    recipientId: string;
    recipientType: NotificationRecipientType;
    page: number;
    perPage: number;
  }): Promise<{ items: NotificationEntity[]; total: number }>;
}
