import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class ProdutoCredito extends BaseModel {
  public static table = 'produto_creditos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare descricao: string | null

  @column()
  declare taxaJurosMensal: number

  @column()
  declare prazoMinimoMeses: number

  @column()
  declare prazoMaximoMeses: number

  @column()
  declare valorMinimo: number

  @column()
  declare valorMaximo: number

  @column()
  declare ativo: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
