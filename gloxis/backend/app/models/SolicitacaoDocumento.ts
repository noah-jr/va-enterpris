import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import SolicitacaoCredito from './SolicitacaoCredito.js'

export default class SolicitacaoDocumento extends BaseModel {
  public static table = 'solicitacao_documentos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare solicitacaoId: number

  @column()
  declare tipoDocumento: string

  @column()
  declare filePath: string

  @column()
  declare fileName: string

  @column()
  declare contentType: string

  @column()
  declare size: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => SolicitacaoCredito)
  declare solicitacao: BelongsTo<typeof SolicitacaoCredito>
}
