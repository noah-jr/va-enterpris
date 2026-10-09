import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'configuracoes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('chave', 255).primary()
      table.text('valor').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
