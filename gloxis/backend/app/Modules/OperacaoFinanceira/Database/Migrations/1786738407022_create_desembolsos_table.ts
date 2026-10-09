import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'desembolsos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('solicitacao_id')
        .unsigned()
        .references('id')
        .inTable('solicitacao_creditos')
        .onDelete('CASCADE')
      table.decimal('valor_desembolsado', 15, 2).notNullable()
      table.enum('metodo', ['TRANSFERENCIA', 'DINHEIRO', 'CHEQUE']).notNullable()
      table.string('comprovante_path').nullable()
      table.enum('status', ['PENDENTE', 'REALIZADO', 'FALHADO']).defaultTo('PENDENTE')

      table.timestamp('data_desembolso').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
