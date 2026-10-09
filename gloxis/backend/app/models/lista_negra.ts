import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Cliente from './Cliente.js'
import User from './user.js'

export default class ListaNegra extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare clienteId: number

  @column()
  declare motivo: string

  @column.dateTime()
  declare dataInclusao: DateTime

  @column()
  declare ativo: boolean

  @column()
  declare removidoPor: number | null

  @column.dateTime()
  declare dataRemocao: DateTime | null

  @column()
  declare justificativaRemocao: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Cliente)
  declare cliente: BelongsTo<typeof Cliente>

  @belongsTo(() => User, { foreignKey: 'removidoPor' })
  declare remocaoAutor: BelongsTo<typeof User>
}
