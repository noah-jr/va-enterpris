import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Garantia extends BaseModel {
  public static table = 'garantias'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare solicitacaoId: number

  @column()
  declare tipo: 'FIADOR' | 'IMOVEL' | 'VEICULO' | 'OUTROS'

  @column()
  declare valorEstimado: number

  @column()
  declare descricao: string

  @column()
  declare detalhes: Record<string, unknown>

  @column()
  declare statusAvaliacao: 'PENDENTE' | 'AVALIADO' | 'REJEITADO'

  @column()
  declare valorAvaliado: number | null

  @column()
  declare avaliadoPor: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
