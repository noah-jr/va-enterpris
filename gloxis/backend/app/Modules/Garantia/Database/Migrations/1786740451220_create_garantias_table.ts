import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'garantias'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('solicitacao_id')
        .unsigned()
        .references('id')
        .inTable('solicitacao_creditos')
        .onDelete('CASCADE')

      table.enum('tipo', ['FIADOR', 'IMOVEL', 'VEICULO', 'OUTROS']).notNullable()
      table.decimal('valor_estimado', 12, 2).notNullable()
      table.text('descricao').notNullable()

      // Detalhes extras via JSON para flexibilidade (Ex: Matrícula de Imóvel, Placa do Veículo, BI do Fiador)
      table.json('detalhes').nullable()

      table.enum('status_avaliacao', ['PENDENTE', 'AVALIADO', 'REJEITADO']).defaultTo('PENDENTE')
      table.decimal('valor_avaliado', 12, 2).nullable() // O valor real após perícia/avaliação do gestor
      table.integer('avaliado_por').unsigned().references('id').inTable('users').nullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
