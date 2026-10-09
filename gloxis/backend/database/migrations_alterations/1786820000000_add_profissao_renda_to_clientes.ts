import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'clientes'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('profissao').nullable()
      table.decimal('renda_mensal', 12, 2).nullable().defaultTo(0)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('profissao')
      table.dropColumn('renda_mensal')
    })
  }
}
