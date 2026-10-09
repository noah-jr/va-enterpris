import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import SolicitacaoCredito from '#models/SolicitacaoCredito'

export default class Desembolso extends BaseModel {
  public static table = 'desembolsos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare solicitacaoId: number

  @column()
  declare valorDesembolsado: number

  @column()
  declare metodo: 'TRANSFERENCIA' | 'DINHEIRO' | 'CHEQUE'

  @column()
  declare comprovantePath: string | null

  @column()
  declare status: 'PENDENTE' | 'REALIZADO' | 'FALHADO'

  @column.dateTime()
  declare dataDesembolso: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => SolicitacaoCredito)
  declare solicitacao: BelongsTo<typeof SolicitacaoCredito>
}
