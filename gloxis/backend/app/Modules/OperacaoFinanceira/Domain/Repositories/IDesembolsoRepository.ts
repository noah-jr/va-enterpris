import { type Desembolso } from '../Entities/Desembolso.js'

export interface IDesembolsoRepository {
  create(desembolso: Desembolso): Promise<Desembolso>
  findById(id: number): Promise<Desembolso | null>
  findBySolicitacaoId(solicitacaoId: number): Promise<Desembolso | null>
  update(desembolso: Desembolso): Promise<Desembolso>
}
