import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contratos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('tipo').defaultTo('PRESTACAO_SERVICOS')
      table.string('parte_contratante').nullable()
      table.decimal('valor_contrato', 12, 2).defaultTo(0)
      table.date('data_inicio').nullable()
      table.date('data_fim').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('tipo')
      table.dropColumn('parte_contratante')
      table.dropColumn('valor_contrato')
      table.dropColumn('data_inicio')
      table.dropColumn('data_fim')
    })
  }
}
