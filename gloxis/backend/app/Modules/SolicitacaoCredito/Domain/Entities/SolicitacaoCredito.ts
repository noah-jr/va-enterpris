export type SolicitacaoStatus =
  | 'PENDENTE'
  | 'EM_ANALISE'
  | 'APROVADO'
  | 'APROVADA'
  | 'REJEITADO'
  | 'REJEITADA'
  | 'DESEMBOLSADO'
  | 'CANCELADO'

export class SolicitacaoCredito {
  public readonly id: number
  public clienteId: number
  public valor: number
  public parcelas: number
  public status: SolicitacaoStatus
  public motivoRejeicao?: string
  public createdAt: Date
  public updatedAt: Date

  constructor(
    id: number,
    clienteId: number,
    valor: number,
    parcelas: number,
    status: SolicitacaoStatus,
    createdAt: Date,
    updatedAt: Date,
    motivoRejeicao?: string
  ) {
    this.id = id
    this.clienteId = clienteId
    this.valor = valor
    this.parcelas = parcelas
    this.status = status
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.motivoRejeicao = motivoRejeicao
  }
}
