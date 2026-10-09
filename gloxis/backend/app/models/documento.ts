import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Documento extends BaseModel {
  public static table = 'documentos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare titulo: string

  @column()
  declare caminho: string

  @column()
  declare categoria: string

  @column()
  declare departamento: string

  @column()
  declare status: string

  @column()
  declare clienteNome: string | null

  @column()
  declare clienteEmail: string | null

  @column()
  declare notas: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
