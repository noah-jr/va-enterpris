import { BaseSchema } from '@adonisjs/lucid/schema'

export default class SolicitacaoCreditos extends BaseSchema {
  protected tableName = 'solicitacao_creditos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('cliente_id')
        .unsigned()
        .references('id')
        .inTable('clientes')
        .onDelete('CASCADE')
      table.decimal('valor', 15, 2).notNullable()
      table.integer('parcelas').unsigned().notNullable()
      table.enum('status', ['PENDENTE', 'APROVADO', 'REJEITADO']).defaultTo('PENDENTE')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
