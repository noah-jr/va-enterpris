import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class TransparenciaMetrica extends BaseModel {
  public static table = 'transparencia_metricas'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare chave: string

  @column()
  declare label: string

  @column()
  declare val: string

  @column()
  declare ordem: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
