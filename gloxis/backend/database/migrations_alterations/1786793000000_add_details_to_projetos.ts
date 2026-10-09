import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'projetos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('gerente_projeto').nullable()
      table.string('cliente_nome').nullable()
      table.integer('progresso_percentual').defaultTo(0)
      table.date('data_inicio').nullable()
      table.date('data_prevista_fim').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('gerente_projeto')
      table.dropColumn('cliente_nome')
      table.dropColumn('progresso_percentual')
      table.dropColumn('data_inicio')
      table.dropColumn('data_prevista_fim')
    })
  }
}
