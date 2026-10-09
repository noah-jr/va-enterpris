import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class MensagemInbox extends BaseModel {
  public static table = 'mensagens_inbox'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare remetenteId: number | null

  @column()
  declare remetenteNome: string

  @column()
  declare remetenteTipo: string

  @column()
  declare destinatarioId: number | null

  @column()
  declare destinatarioNome: string

  @column()
  declare destinatarioTipo: string

  @column()
  declare assunto: string

  @column()
  declare conteudo: string

  @column()
  declare documentoId: number | null

  @column()
  declare lida: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
