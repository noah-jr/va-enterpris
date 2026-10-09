import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'solicitacao_creditos'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('motivo_rejeicao').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('motivo_rejeicao')
    })
  }
}
