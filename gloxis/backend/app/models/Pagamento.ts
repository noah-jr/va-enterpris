import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import SolicitacaoCredito from '#models/SolicitacaoCredito'

export default class Pagamento extends BaseModel {
  public static table = 'pagamentos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare solicitacaoId: number | null

  @column()
  declare descricao: string | null

  @column()
  declare tipo: 'RECEITA' | 'DESPESA' | 'TRANSF'

  @column()
  declare categoria: string

  @column()
  declare entidadeNome: string | null

  @column()
  declare contaBancaria: string

  @column()
  declare numeroParcela: number | null

  @column()
  declare valorParcela: number | null

  @column()
  declare valorPago: number

  @column()
  declare valorJurosMora: number | null

  @column()
  declare valorMulta: number | null

  @column()
  declare metodo: 'TRANSFERENCIA' | 'MULTICAIXA' | 'DINHEIRO'

  @column()
  declare reciboPath: string | null

  @column()
  declare status: 'PENDENTE' | 'PROCESSADO' | 'CONCLUIDO' | 'REJEITADO' | 'ATRASADO'

  @column.dateTime()
  declare dataVencimento: DateTime | null

  @column.dateTime()
  declare dataPagamento: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => SolicitacaoCredito)
  declare solicitacao: BelongsTo<typeof SolicitacaoCredito>
}
