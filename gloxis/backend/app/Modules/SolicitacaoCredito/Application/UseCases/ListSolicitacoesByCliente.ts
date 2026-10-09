import { type ISolicitacaoCreditoRepository } from '../../Domain/Repositories/ISolicitacaoCreditoRepository.js'
import { type SolicitacaoCredito } from '../../Domain/Entities/SolicitacaoCredito.js'
import { SolicitacaoCreditoRepositoryImpl } from '../../Infrastructure/Repositories/SolicitacaoCreditoRepositoryImpl.js'

/**
 * Use case to list all credit requests for a given client.
 */
export class ListSolicitacoesByCliente {
  private repository: ISolicitacaoCreditoRepository

  constructor(repository?: ISolicitacaoCreditoRepository) {
    this.repository = repository ?? new SolicitacaoCreditoRepositoryImpl()
  }

  async execute(clienteId: number): Promise<SolicitacaoCredito[]> {
    return await this.repository.findByClienteId(clienteId)
  }
}
