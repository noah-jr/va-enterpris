import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campanhas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome').notNullable()
      table.string('descricao').nullable()
      table.decimal('desconto_taxa_juros', 5, 2).defaultTo(0)
      table.decimal('percentual_cashback', 5, 2).defaultTo(0)
      table.dateTime('data_inicio').notNullable()
      table.dateTime('data_fim').notNullable()
      table.boolean('ativo').defaultTo(true)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
