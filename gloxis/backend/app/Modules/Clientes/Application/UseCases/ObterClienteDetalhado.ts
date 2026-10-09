import { type IClienteRepository } from '../../Domain/Repositories/IClienteRepository.js'

export class ObterClienteDetalhado {
  constructor(private repository: IClienteRepository) {}

  async execute(id: number) {
    return await this.repository.findByIdWithDetails(id)
  }
}
