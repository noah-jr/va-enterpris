import type { IContactRequestRepository } from '../../../domain/repositories/contact.repository.interface.js';
import type { ContactRequestDTO, PaginatedResponse } from '@accountable/types';
import { toContactRequestDTO } from './contact.mapper.js';

export class ListContactRequestsUseCase {
  constructor(private readonly contactRequestRepository: IContactRequestRepository) {}

  async execute(params: { page: number; perPage: number }): Promise<PaginatedResponse<ContactRequestDTO>> {
    const { items, total } = await this.contactRequestRepository.list(params);

    return {
      data: items.map(toContactRequestDTO),
      total,
      page: params.page,
      perPage: params.perPage,
      totalPages: Math.ceil(total / params.perPage),
    };
  }
}
