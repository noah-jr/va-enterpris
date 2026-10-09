import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'renegociacoes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('solicitacao_id')
        .unsigned()
        .references('id')
        .inTable('solicitacao_creditos')
        .onDelete('CASCADE')
      table
        .integer('cliente_id')
        .unsigned()
        .references('id')
        .inTable('clientes')
        .onDelete('CASCADE')

      table.decimal('saldo_devedor_original', 12, 2).notNullable()
      table.decimal('juros_mora_perdoados', 12, 2).defaultTo(0)
      table.decimal('multas_perdoadas', 12, 2).defaultTo(0)
      table.decimal('novo_saldo_devedor', 12, 2).notNullable()

      table.integer('novas_parcelas').notNullable()
      table.decimal('nova_taxa_juros', 5, 2).notNullable() // Em percentagem

      table
        .enum('status', ['PENDENTE_APROVACAO', 'APROVADO', 'REJEITADO'])
        .defaultTo('PENDENTE_APROVACAO')
      table.integer('aprovado_por').unsigned().references('id').inTable('users').nullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
