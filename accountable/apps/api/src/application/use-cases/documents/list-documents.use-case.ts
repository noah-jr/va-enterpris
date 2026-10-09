import type { DocumentPriority, DocumentStatus, PaginatedResponse } from '@accountable/types';
import type {
  IDocumentRepository,
  DocumentEntity,
} from '../../../domain/repositories/document.repository.interface.js';

export interface ListDocumentsInput {
  page?: number;
  perPage?: number;
  status?: DocumentStatus;
  priority?: DocumentPriority;
  search?: string;
  clientId?: string; // apenas utilizadores internos podem especificar outro clientId
}

export class ListDocumentsUseCase {
  constructor(private readonly documentRepository: IDocumentRepository) {}

  async execute(
    input: ListDocumentsInput,
    context: {
      actorId: string;
      actorType: 'client' | 'user';
    },
  ): Promise<PaginatedResponse<DocumentEntity>> {
    const page = Math.max(1, input.page ?? 1);
    const perPage = Math.min(100, Math.max(1, input.perPage ?? 20));

    // Regra de segurança: se o ator for CLIENT, força o filtro para o seu próprio ID
    const effectiveClientId =
      context.actorType === 'client' ? context.actorId : input.clientId;

    const { items, total } = await this.documentRepository.list({
      page,
      perPage,
      status: input.status,
      priority: input.priority,
      search: input.search,
      clientId: effectiveClientId,
    });

    const totalPages = Math.ceil(total / perPage);

    return {
      data: items,
      total,
      page,
      perPage,
      totalPages,
    };
  }
}
