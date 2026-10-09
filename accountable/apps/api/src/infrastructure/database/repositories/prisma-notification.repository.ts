import type { PrismaClient, Prisma } from '@prisma/client';
import type {
  INotificationRepository,
  NotificationEntity,
  CreateNotificationData,
  NotificationRecipientType,
} from '../../../domain/repositories/notification.repository.interface.js';

function toEntity(row: {
  id: string;
  recipientId: string;
  recipientType: string;
  type: string;
  title: string;
  body: string;
  metadata: Prisma.JsonValue;
  readAt: Date | null;
  createdAt: Date;
}): NotificationEntity {
  return {
    id: row.id,
    recipientId: row.recipientId,
    recipientType: row.recipientType as NotificationRecipientType,
    type: row.type,
    title: row.title,
    body: row.body,
    metadata: (row.metadata as Record<string, unknown> | null) ?? null,
    readAt: row.readAt,
    createdAt: row.createdAt,
  };
}

export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateNotificationData): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        recipientType: data.recipientType,
        type: data.type,
        title: data.title,
        body: data.body,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });
    return toEntity(notification);
  }

  async findById(id: string): Promise<NotificationEntity | null> {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    return notification ? toEntity(notification) : null;
  }

  async markRead(id: string): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
    return toEntity(notification);
  }

  async listForRecipient(params: {
    recipientId: string;
    recipientType: NotificationRecipientType;
    page: number;
    perPage: number;
  }): Promise<{ items: NotificationEntity[]; total: number }> {
    const { recipientId, recipientType, page, perPage } = params;
    const skip = (page - 1) * perPage;
    const where = { recipientId, recipientType };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { items: items.map(toEntity), total };
  }
}
