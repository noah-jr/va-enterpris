import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Configuracao extends BaseModel {
  public static table = 'configuracoes'

  @column({ isPrimary: true })
  declare chave: string

  @column()
  declare valor: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
