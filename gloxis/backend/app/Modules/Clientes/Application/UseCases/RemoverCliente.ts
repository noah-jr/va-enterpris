import { type IClienteRepository } from '../../Domain/Repositories/IClienteRepository.js'

export class RemoverCliente {
  constructor(private repository: IClienteRepository) {}

  async execute(id: number) {
    return await this.repository.delete(id)
  }
}
