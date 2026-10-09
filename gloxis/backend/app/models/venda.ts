import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Venda extends BaseModel {
  public static table = 'vendas'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare clienteId: number | null

  @column()
  declare clienteNome: string | null

  @column()
  declare clienteEmail: string | null

  @column()
  declare valor: number

  @column()
  declare status: string

  @column()
  declare formaPagamento: string

  @column()
  declare itensJson: string | null

  @column()
  declare desconto: number

  @column()
  declare impostoIva: number

  @column()
  declare notas: string | null

  @column()
  declare vendedor: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
