import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lancamentos_contabeis'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('codigo_conta').defaultTo('11.1')
      table.string('descricao').nullable()
      table.string('diario').defaultTo('Diário Geral')
      table.string('exercicio_fiscal').defaultTo('2026')
      table.string('criado_por').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('codigo_conta')
      table.dropColumn('descricao')
      table.dropColumn('diario')
      table.dropColumn('exercicio_fiscal')
      table.dropColumn('criado_por')
    })
  }
}
