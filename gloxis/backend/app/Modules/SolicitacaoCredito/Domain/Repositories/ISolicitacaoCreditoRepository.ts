import { type SolicitacaoCredito } from '../Entities/SolicitacaoCredito.js'

export interface ISolicitacaoCreditoRepository {
  create(solicitacao: SolicitacaoCredito): Promise<SolicitacaoCredito>
  findById(id: number): Promise<SolicitacaoCredito | null>
  findByClienteId(clienteId: number): Promise<SolicitacaoCredito[]>
  update(solicitacao: SolicitacaoCredito): Promise<SolicitacaoCredito>
}
