import { type IClienteRepository } from '../../Domain/Repositories/IClienteRepository.js'
import type { ClienteFilterDTO } from '../DTOs/ClienteDTOs.js'

export class ExportarClientes {
  constructor(private repository: IClienteRepository) {}

  async execute(params: ClienteFilterDTO = {}) {
    return await this.repository.exportData(params)
  }
}
