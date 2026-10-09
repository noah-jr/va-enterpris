import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Cliente from './Cliente.js'

export default class ClassificacaoCliente extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare clienteId: number

  @column()
  declare nivel: 'BRONZE' | 'PRATA' | 'OURO' | 'PLATINUM' | 'PREMIUM'

  @column()
  declare pontosFidelidade: number

  @column()
  declare creditosPagosSucesso: number

  @column()
  declare valorTotalPago: number

  @column()
  declare diasMediosAtraso: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Cliente)
  declare cliente: BelongsTo<typeof Cliente>
}
