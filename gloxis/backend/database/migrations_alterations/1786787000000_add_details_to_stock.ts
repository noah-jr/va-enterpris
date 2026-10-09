import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stock_items'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('nome').nullable()
      table.string('codigo_sku').nullable()
      table.string('categoria').defaultTo('GERAL')
      table.decimal('preco_unitario', 12, 2).defaultTo(0)
      table.string('localizacao').defaultTo('Armazém Central - Luanda')
      table.integer('minimo_alerta').defaultTo(10)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('nome')
      table.dropColumn('codigo_sku')
      table.dropColumn('categoria')
      table.dropColumn('preco_unitario')
      table.dropColumn('localizacao')
      table.dropColumn('minimo_alerta')
    })
  }
}
