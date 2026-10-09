import { type AnaliseAprovacao } from '../../Domain/Entities/AnaliseAprovacao.js'

export interface IAnaliseAprovacaoRepository {
  create(analise: AnaliseAprovacao): Promise<AnaliseAprovacao>
  findById(id: number): Promise<AnaliseAprovacao | null>
  findBySolicitacaoId(solicitacaoId: number): Promise<AnaliseAprovacao | null>
  update(analise: AnaliseAprovacao): Promise<AnaliseAprovacao>
}
