import type { IClientRepository } from '../../../domain/repositories/client.repository.interface.js';
import type { PaginatedResponse, ClientListItemDTO } from '@accountable/types';
import type { ClientFilterInput } from '@accountable/schemas';

export class ListClientsUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(params: ClientFilterInput): Promise<PaginatedResponse<ClientListItemDTO>> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 20;

    const { items, total } = await this.clientRepository.list({
      page,
      perPage,
      search: params.search,
      isActive: params.isActive,
    });

    const data: ClientListItemDTO[] = items.map((c) => ({
      id: c.id,
      nip: c.nip,
      name: c.name,
      email: c.email,
      company: c.company,
      isActive: c.isActive,
      emailVerified: c.emailVerified,
      documentsCount: c.documentsCount ?? 0,
      createdAt: c.createdAt.toISOString(),
    }));

    return {
      data,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }
}
