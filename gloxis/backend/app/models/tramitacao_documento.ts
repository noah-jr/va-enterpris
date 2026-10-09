import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class TramitacaoDocumento extends BaseModel {
  public static table = 'tramitacoes_documento'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare documentoId: number

  @column()
  declare origem: string

  @column()
  declare destino: string

  @column()
  declare despacho: string | null

  @column()
  declare usuario: string

  @column()
  declare statusAnterior: string

  @column()
  declare statusNovo: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
