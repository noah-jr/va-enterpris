import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Contrato extends BaseModel {
  public static table = 'contratos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare titulo: string

  @column()
  declare tipo: string

  @column()
  declare parteContratante: string | null

  @column()
  declare valorContrato: number

  @column()
  declare status: 'ATIVO' | 'CANCELADO' | 'EXPIRADO'

  @column.date()
  declare dataInicio: DateTime | null

  @column.date()
  declare dataFim: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
