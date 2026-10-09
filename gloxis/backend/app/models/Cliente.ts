import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Cliente extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare nif: string

  @column()
  declare userId?: number

  @column()
  declare documentos?: string

  @column()
  declare endereco?: string

  @column()
  declare contaBancaria?: string

  @column()
  declare fotografia?: string

  @column()
  declare logotipo?: string

  @column()
  declare email?: string

  @column()
  declare telefone?: string

  @column()
  declare telemovel?: string

  @column()
  declare profissao?: string

  @column({ columnName: 'renda_mensal' })
  declare rendaMensal?: number

  @column()
  declare isListaNegra: boolean

  @column()
  declare classificacao: 'NOVO' | 'BRONZE' | 'PRATA' | 'OURO'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
