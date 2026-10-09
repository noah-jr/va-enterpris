import type { PaginatedResponse } from '@accountable/types';
import type {
  IMessageRepository,
  MessageEntity,
} from '../../../domain/repositories/message.repository.interface.js';
import type { IDocumentRepository } from '../../../domain/repositories/document.repository.interface.js';
import { NotFoundError, ForbiddenError } from '../../../domain/errors/index.js';

export interface ListMessagesInput {
  documentId: string;
  page?: number;
  perPage?: number;
}

export class ListMessagesUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly documentRepository: IDocumentRepository,
  ) {}

  async execute(
    input: ListMessagesInput,
    context: { actorId: string; actorType: 'client' | 'user' },
  ): Promise<PaginatedResponse<MessageEntity>> {
    const document = await this.documentRepository.findById(input.documentId);
    if (!document) {
      throw new NotFoundError('Documento', input.documentId);
    }

    if (context.actorType === 'client' && document.clientId !== context.actorId) {
      throw new ForbiddenError('Acesso não autorizado a este documento.');
    }

    const page = Math.max(1, input.page ?? 1);
    const perPage = Math.min(100, Math.max(1, input.perPage ?? 20));

    const { items, total } = await this.messageRepository.findByDocumentId({
      documentId: input.documentId,
      page,
      perPage,
      includeInternal: context.actorType === 'user',
    });

    return {
      data: items,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }
}
