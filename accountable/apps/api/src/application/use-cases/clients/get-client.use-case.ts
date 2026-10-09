import type { IClientRepository } from '../../../domain/repositories/client.repository.interface.js';
import type { ClientDTO } from '@accountable/types';
import { NotFoundError } from '../../../domain/errors/index.js';

export class GetClientUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(clientId: string): Promise<ClientDTO> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError('Cliente', clientId);
    }

    return {
      id: client.id,
      nip: client.nip,
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      department: client.department,
      isActive: client.isActive,
      emailVerified: client.emailVerified,
      lastLoginAt: client.lastLoginAt ? client.lastLoginAt.toISOString() : null,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    };
  }
}
