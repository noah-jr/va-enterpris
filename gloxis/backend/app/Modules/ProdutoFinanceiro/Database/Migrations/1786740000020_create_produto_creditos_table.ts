import { BaseSchema } from '@adonisjs/lucid/schema'

export default class ProdutoCreditos extends BaseSchema {
  protected tableName = 'produto_creditos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nome').notNullable()
      table.text('descricao').nullable()

      table.decimal('taxa_juros_mensal', 5, 4).notNullable() // e.g., 0.0450 for 4.5%
      table.integer('prazo_minimo_meses').notNullable()
      table.integer('prazo_maximo_meses').notNullable()

      table.decimal('valor_minimo', 12, 2).notNullable()
      table.decimal('valor_maximo', 12, 2).notNullable()

      table.boolean('ativo').defaultTo(true)

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
