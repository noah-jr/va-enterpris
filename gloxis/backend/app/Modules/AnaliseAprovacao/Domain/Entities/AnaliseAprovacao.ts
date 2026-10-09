export class AnaliseAprovacao {
  public readonly id: number
  public solicitacaoId: number
  public score: number // 0‑100
  public decision: 'APROVADO' | 'REJEITADO' | 'MANUAL'
  public motivo: string | null
  public createdAt: Date
  public updatedAt: Date

  constructor(
    id: number,
    solicitacaoId: number,
    score: number,
    decision: 'APROVADO' | 'REJEITADO' | 'MANUAL',
    motivo: string | null = null,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id
    this.solicitacaoId = solicitacaoId
    this.score = score
    this.decision = decision
    this.motivo = motivo
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }
}
