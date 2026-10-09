import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class SolicitacaoCredito extends BaseModel {
  public static table = 'solicitacao_creditos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare clienteId: number

  @column()
  declare valor: number

  @column()
  declare parcelas: number

  @column()
  declare status:
    | 'PENDENTE'
    | 'EM_ANALISE'
    | 'APROVADO'
    | 'APROVADA'
    | 'REJEITADO'
    | 'REJEITADA'
    | 'DESEMBOLSADO'
    | 'CANCELADO'
    | string

  @column()
  declare finalidade: string | null

  @column.dateTime()
  declare dataAprovacao: DateTime | null

  @column.dateTime()
  declare dataInicioPagamento: DateTime | null

  @column.dateTime()
  declare dataVencimentoFinal: DateTime | null

  @column()
  declare taxaJuros: number | null

  @column()
  declare comprovativoDesembolsoPath: string | null

  @column()
  declare motivoRejeicao: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
