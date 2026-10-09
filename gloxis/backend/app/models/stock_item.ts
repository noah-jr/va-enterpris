import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class StockItem extends BaseModel {
  public static table = 'stock_items'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare produtoId: number | null

  @column()
  declare nome: string | null

  @column()
  declare codigoSku: string | null

  @column()
  declare categoria: string

  @column()
  declare quantidade: number

  @column()
  declare precoUnitario: number

  @column()
  declare localizacao: string

  @column()
  declare minimoAlerta: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
