import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pagamentos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('solicitacao_id')
        .unsigned()
        .references('id')
        .inTable('solicitacao_creditos')
        .onDelete('CASCADE')
      table.integer('numero_parcela').unsigned().notNullable()
      table.decimal('valor_pago', 15, 2).notNullable()
      table.decimal('valor_juros_mora', 15, 2).defaultTo(0)
      table.decimal('valor_multa', 15, 2).defaultTo(0)
      table.enum('metodo', ['TRANSFERENCIA', 'MULTICAIXA', 'DINHEIRO']).notNullable()
      table.string('recibo_path').nullable()
      table
        .enum('status', ['PENDENTE', 'PROCESSADO', 'REJEITADO', 'ATRASADO'])
        .defaultTo('PENDENTE')
      table.timestamp('data_vencimento').notNullable()
      table.timestamp('data_pagamento').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
