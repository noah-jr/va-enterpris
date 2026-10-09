import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AuditLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare action: string

  @column()
  declare ipAddress: string | null

  @column()
  declare payload: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}
