import { type ISolicitacaoCreditoRepository } from '../../Domain/Repositories/ISolicitacaoCreditoRepository.js'
import { SolicitacaoCredito } from '../../Domain/Entities/SolicitacaoCredito.js'
import { UpdateSolicitacaoStatusDTO } from '../../Domain/DTOs/UpdateSolicitacaoStatusDTO.js'
import { SolicitacaoCreditoRepositoryImpl } from '../../Infrastructure/Repositories/SolicitacaoCreditoRepositoryImpl.js'

/**
 * Use case to update the status of a credit request.
 */
export class UpdateSolicitacaoStatus {
  private repository: ISolicitacaoCreditoRepository

  constructor(repository?: ISolicitacaoCreditoRepository) {
    this.repository = repository ?? new SolicitacaoCreditoRepositoryImpl()
  }

  async execute(payload: {
    id: number
    status:
      | 'PENDENTE'
      | 'EM_ANALISE'
      | 'APROVADO'
      | 'APROVADA'
      | 'REJEITADO'
      | 'REJEITADA'
      | 'DESEMBOLSADO'
      | 'CANCELADO'
      | string
    motivoRejeicao?: string
  }): Promise<SolicitacaoCredito> {
    // Validate payload using Zod schema (will throw if invalid).
    const validated = UpdateSolicitacaoStatusDTO.parse(payload)
    const existing = await this.repository.findById(validated.id)
    if (!existing) throw new Error('Solicitacao not found')
    const updated = new SolicitacaoCredito(
      existing.id,
      existing.clienteId,
      existing.valor,
      existing.parcelas,
      validated.status as any,
      existing.createdAt,
      new Date(),
      validated.motivoRejeicao
    )
    return await this.repository.update(updated)
  }
}
