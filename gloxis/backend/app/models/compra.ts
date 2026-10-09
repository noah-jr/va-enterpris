import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Compra extends BaseModel {
  public static table = 'compras'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fornecedorId: number | null

  @column()
  declare fornecedorNome: string | null

  @column()
  declare fornecedorNif: string | null

  @column()
  declare categoria: string

  @column()
  declare formaPagamento: string

  @column()
  declare valor: number

  @column()
  declare status: string

  @column()
  declare itensJson: string | null

  @column()
  declare notas: string | null

  @column()
  declare comprador: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
