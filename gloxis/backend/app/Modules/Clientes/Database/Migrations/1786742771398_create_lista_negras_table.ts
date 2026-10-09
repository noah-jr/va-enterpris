import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lista_negras'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('cliente_id')
        .unsigned()
        .references('id')
        .inTable('clientes')
        .onDelete('CASCADE')
      table.string('motivo').notNullable()
      table.timestamp('data_inclusao').notNullable()
      table.boolean('ativo').defaultTo(true) // Se 'false', significa que foi removido

      // Dados da remoção (quando houver)
      table.integer('removido_por').unsigned().references('id').inTable('users').nullable()
      table.timestamp('data_remocao').nullable()
      table.text('justificativa_remocao').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
