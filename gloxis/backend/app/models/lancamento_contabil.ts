import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class LancamentoContabil extends BaseModel {
  public static table = 'lancamentos_contabeis'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare codigoConta: string

  @column()
  declare conta: string

  @column()
  declare descricao: string | null

  @column()
  declare diario: string

  @column()
  declare valor: number

  @column()
  declare tipo: 'DEBITO' | 'CREDITO'

  @column()
  declare exercicioFiscal: string

  @column()
  declare criadoPor: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
