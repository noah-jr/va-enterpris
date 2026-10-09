import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'vendas'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('cliente_nome').nullable()
      table.string('cliente_email').nullable()
      table.string('forma_pagamento').defaultTo('MULTICAIXA')
      table.text('itens_json').nullable()
      table.decimal('desconto', 12, 2).defaultTo(0)
      table.decimal('imposto_iva', 12, 2).defaultTo(14)
      table.text('notas').nullable()
      table.string('vendedor').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('cliente_nome')
      table.dropColumn('cliente_email')
      table.dropColumn('forma_pagamento')
      table.dropColumn('itens_json')
      table.dropColumn('desconto')
      table.dropColumn('imposto_iva')
      table.dropColumn('notas')
      table.dropColumn('vendedor')
    })
  }
}
