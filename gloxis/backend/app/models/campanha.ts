import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Campanha extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare descricao: string | null

  @column()
  declare descontoTaxaJuros: number

  @column()
  declare percentualCashback: number

  @column.dateTime()
  declare dataInicio: DateTime

  @column.dateTime()
  declare dataFim: DateTime

  @column()
  declare ativo: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
