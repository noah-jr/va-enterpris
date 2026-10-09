import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'classificacao_clientes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('cliente_id')
        .unsigned()
        .references('id')
        .inTable('clientes')
        .onDelete('CASCADE')
        .unique()
      table.enum('nivel', ['BRONZE', 'PRATA', 'OURO', 'PLATINUM', 'PREMIUM']).defaultTo('BRONZE')
      table.integer('pontos_fidelidade').defaultTo(0)

      // Histórico para progressão
      table.integer('creditos_pagos_sucesso').defaultTo(0)
      table.decimal('valor_total_pago', 12, 2).defaultTo(0)
      table.integer('dias_medios_atraso').defaultTo(0)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
