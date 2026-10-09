import { type IClienteRepository } from '../../Domain/Repositories/IClienteRepository.js'

export class ObterDashboardCliente {
  constructor(private repository: IClienteRepository) {}

  async execute(userId: number) {
    const data = await this.repository.findDashboardMetrics(userId)
    if (!data) throw new Error('Cliente não encontrado')
    return data
  }
}
