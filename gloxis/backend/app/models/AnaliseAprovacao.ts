import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AnaliseAprovacao extends BaseModel {
  public static table = 'analises_aprovacao'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare solicitacaoId: number

  @column()
  declare decision: 'APROVADO' | 'REJEITADO' | 'MANUAL'

  @column()
  declare scoreFinal: number

  @column()
  declare justificativa: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
