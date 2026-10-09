import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'solicitacao_creditos'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('finalidade').nullable()
      table.timestamp('data_aprovacao').nullable()
      table.timestamp('data_inicio_pagamento').nullable() // data do 1º desembolso
      table.timestamp('data_vencimento_final').nullable() // data da última parcela
      table.decimal('taxa_juros', 5, 4).defaultTo(0.03) // 3% ao mês por defeito
      table.string('comprovativo_desembolso_path').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('finalidade')
      table.dropColumn('data_aprovacao')
      table.dropColumn('data_inicio_pagamento')
      table.dropColumn('data_vencimento_final')
      table.dropColumn('taxa_juros')
      table.dropColumn('comprovativo_desembolso_path')
    })
  }
}
