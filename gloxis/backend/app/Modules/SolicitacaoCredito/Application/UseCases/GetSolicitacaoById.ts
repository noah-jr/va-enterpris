import { type ISolicitacaoCreditoRepository } from '../../Domain/Repositories/ISolicitacaoCreditoRepository.js'
import { type SolicitacaoCredito } from '../../Domain/Entities/SolicitacaoCredito.js'
import { SolicitacaoCreditoRepositoryImpl } from '../../Infrastructure/Repositories/SolicitacaoCreditoRepositoryImpl.js'

/**
 * Use case to retrieve a credit request by its identifier.
 */
export class GetSolicitacaoById {
  private repository: ISolicitacaoCreditoRepository

  constructor(repository?: ISolicitacaoCreditoRepository) {
    this.repository = repository ?? new SolicitacaoCreditoRepositoryImpl()
  }

  async execute(id: number): Promise<SolicitacaoCredito | null> {
    return await this.repository.findById(id)
  }
}
