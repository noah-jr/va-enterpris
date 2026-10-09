import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'faturas'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('cliente_nome').nullable()
      table.string('cliente_nif').nullable()
      table.string('tipo_documento').defaultTo('FT')
      table.decimal('valor_imposto', 12, 2).defaultTo(0)
      table.decimal('valor_retencao', 12, 2).defaultTo(0)
      table.string('hash_agt').nullable()
      table.text('itens_json').nullable()
      table.date('data_vencimento').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('cliente_nome')
      table.dropColumn('cliente_nif')
      table.dropColumn('tipo_documento')
      table.dropColumn('valor_imposto')
      table.dropColumn('valor_retencao')
      table.dropColumn('hash_agt')
      table.dropColumn('itens_json')
      table.dropColumn('data_vencimento')
    })
  }
}
