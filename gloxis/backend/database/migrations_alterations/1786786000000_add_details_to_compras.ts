import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'compras'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('fornecedor_nome').nullable()
      table.string('fornecedor_nif').nullable()
      table.string('categoria').defaultTo('GERAL')
      table.string('forma_pagamento').defaultTo('TRANSFERENCIA')
      table.text('itens_json').nullable()
      table.text('notas').nullable()
      table.string('comprador').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('fornecedor_nome')
      table.dropColumn('fornecedor_nif')
      table.dropColumn('categoria')
      table.dropColumn('forma_pagamento')
      table.dropColumn('itens_json')
      table.dropColumn('notas')
      table.dropColumn('comprador')
    })
  }
}
