import { type Pagamento } from '../Entities/Pagamento.js'

export interface IPagamentoRepository {
  create(pagamento: Pagamento): Promise<Pagamento>
  findById(id: number): Promise<Pagamento | null>
  findBySolicitacaoId(solicitacaoId: number): Promise<Pagamento[]>
  findPendentesAtrasados(dataAtual: Date): Promise<Pagamento[]>
  update(pagamento: Pagamento): Promise<Pagamento>
  updateBatch(pagamentos: Pagamento[]): Promise<void>
}
