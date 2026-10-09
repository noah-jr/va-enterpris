import type { PrismaClient } from '@prisma/client';
import type {
  IMessageRepository,
  MessageEntity,
  CreateMessageData,
} from '../../../domain/repositories/message.repository.interface.js';

export class PrismaMessageRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateMessageData): Promise<MessageEntity> {
    const message = await this.prisma.message.create({
      data: {
        documentId: data.documentId,
        senderId: data.senderId,
        senderType: data.senderType,
        content: data.content,
        isInternal: data.isInternal,
      },
    });
    return message;
  }

  async findById(id: string): Promise<MessageEntity | null> {
    const message = await this.prisma.message.findFirst({
      where: { id, deletedAt: null },
    });
    return message;
  }

  async findByDocumentId(params: {
    documentId: string;
    page: number;
    perPage: number;
    includeInternal: boolean;
  }): Promise<{ items: MessageEntity[]; total: number }> {
    const { documentId, page, perPage, includeInternal } = params;
    const skip = (page - 1) * perPage;

    const where = {
      documentId,
      deletedAt: null,
      ...(includeInternal ? {} : { isInternal: false }),
    };

    const [items, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.message.count({ where }),
    ]);

    return { items, total };
  }
}
