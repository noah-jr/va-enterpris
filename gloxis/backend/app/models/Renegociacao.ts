import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Renegociacao extends BaseModel {
  public static table = 'renegociacoes'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare solicitacaoId: number

  @column()
  declare clienteId: number

  @column()
  declare saldoDevedorOriginal: number

  @column()
  declare jurosMoraPerdoados: number

  @column()
  declare multasPerdoadas: number

  @column()
  declare novoSaldoDevedor: number

  @column()
  declare novasParcelas: number

  @column()
  declare novaTaxaJuros: number

  @column()
  declare status: 'PENDENTE_APROVACAO' | 'APROVADO' | 'REJEITADO'

  @column()
  declare aprovadoPor: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
