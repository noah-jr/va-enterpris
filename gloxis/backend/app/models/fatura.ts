import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Fatura extends BaseModel {
  public static table = 'faturas'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare clienteId: number | null

  @column()
  declare clienteNome: string | null

  @column()
  declare clienteNif: string | null

  @column()
  declare tipoDocumento: string

  @column()
  declare valor: number

  @column()
  declare valorImposto: number

  @column()
  declare valorRetencao: number

  @column()
  declare status: string

  @column()
  declare hashAgt: string | null

  @column()
  declare itensJson: string | null

  @column.date()
  declare dataVencimento: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
