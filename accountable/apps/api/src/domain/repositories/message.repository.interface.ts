import type { SenderType } from '@accountable/types';

export interface MessageEntity {
  id: string;
  documentId: string;
  senderId: string;
  senderType: SenderType;
  content: string;
  isInternal: boolean;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface CreateMessageData {
  documentId: string;
  senderId: string;
  senderType: SenderType;
  content: string;
  isInternal: boolean;
}

export interface IMessageRepository {
  create(data: CreateMessageData): Promise<MessageEntity>;
  findById(id: string): Promise<MessageEntity | null>;
  findByDocumentId(params: {
    documentId: string;
    page: number;
    perPage: number;
    includeInternal: boolean;
  }): Promise<{ items: MessageEntity[]; total: number }>;
}
