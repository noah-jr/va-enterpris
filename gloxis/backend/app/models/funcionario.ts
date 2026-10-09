import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Funcionario extends BaseModel {
  public static table = 'funcionarios'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare cargo: string

  @column()
  declare departamento: string

  @column()
  declare nif: string | null

  @column()
  declare iban: string | null

  @column()
  declare salario: number

  @column()
  declare subsidioAlimentacao: number

  @column()
  declare subsidioTransporte: number

  @column()
  declare status: 'ATIVO' | 'FERIAS' | 'LICENCA' | 'DESLIGADO'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
