import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class TransparenciaDocumento extends BaseModel {
  public static table = 'transparencia_documentos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare date: string

  @column()
  declare size: string | null

  @column()
  declare categoria: string

  @column()
  declare fileUrl: string

  @column()
  declare ordem: number

  @column()
  declare ativo: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
