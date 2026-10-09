import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'analises_aprovacao'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('solicitacao_id')
        .unsigned()
        .references('id')
        .inTable('solicitacao_creditos')
        .onDelete('CASCADE')
      table.integer('score').notNullable()
      table.enum('decision', ['APROVADO', 'REJEITADO']).notNullable()
      table.string('motivo').nullable()
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
