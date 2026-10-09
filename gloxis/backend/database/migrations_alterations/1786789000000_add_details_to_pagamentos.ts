import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pagamentos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('descricao').nullable()
      table.string('tipo').defaultTo('RECEITA')
      table.string('categoria').defaultTo('OPERACIONAL')
      table.string('entidade_nome').nullable()
      table.string('conta_bancaria').defaultTo('BFA - Conta Corrente Principal')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('descricao')
      table.dropColumn('tipo')
      table.dropColumn('categoria')
      table.dropColumn('entidade_nome')
      table.dropColumn('conta_bancaria')
    })
  }
}
