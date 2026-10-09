import { type IClienteRepository } from '../../Domain/Repositories/IClienteRepository.js'
import type { UpdateClienteDTO } from '../DTOs/ClienteDTOs.js'

export class AtualizarCliente {
  constructor(private repository: IClienteRepository) {}

  async execute(id: number, payload: UpdateClienteDTO) {
    return await this.repository.update(id, payload)
  }
}
