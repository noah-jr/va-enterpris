import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Projeto extends BaseModel {
  public static table = 'projetos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare gerenteProjeto: string | null

  @column()
  declare clienteNome: string | null

  @column()
  declare orcamento: number

  @column()
  declare progressoPercentual: number

  @column()
  declare status: 'PLANEAMENTO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'

  @column.date()
  declare dataInicio: DateTime | null

  @column.date()
  declare dataPrevistaFim: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
