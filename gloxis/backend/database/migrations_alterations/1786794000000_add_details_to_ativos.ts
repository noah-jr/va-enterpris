import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'ativos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('categoria').defaultTo('Equipamento Informático')
      table.string('localizacao').defaultTo('Sede Luanda')
      table.string('responsavel').nullable()
      table.string('estado_conservacao').defaultTo('EXCELENTE')
      table.decimal('taxa_depreciacao_anual', 5, 2).defaultTo(20.0)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('categoria')
      table.dropColumn('localizacao')
      table.dropColumn('responsavel')
      table.dropColumn('estado_conservacao')
      table.dropColumn('taxa_depreciacao_anual')
    })
  }
}
