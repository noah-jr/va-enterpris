import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Ativo extends BaseModel {
  public static table = 'ativos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare categoria: string

  @column()
  declare localizacao: string

  @column()
  declare responsavel: string | null

  @column()
  declare valor: number

  @column()
  declare estadoConservacao: 'EXCELENTE' | 'BOM' | 'REGULAR' | 'DANIFICADO' | 'ABATIDO'

  @column()
  declare taxaDepreciacaoAnual: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
