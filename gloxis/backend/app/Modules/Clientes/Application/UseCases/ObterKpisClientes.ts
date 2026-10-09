import { type IClienteRepository } from '../../Domain/Repositories/IClienteRepository.js'

export class ObterKpisClientes {
  constructor(private repository: IClienteRepository) {}

  async execute() {
    return await this.repository.getKpis()
  }
}
