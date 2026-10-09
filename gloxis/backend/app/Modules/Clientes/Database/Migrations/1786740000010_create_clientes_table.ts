import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Clientes extends BaseSchema {
  protected tableName = 'clientes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome').notNullable()
      table.string('nif').unique().notNullable()
      table.text('documentos').nullable()
      table.text('endereco').nullable()
      table.text('conta_bancaria').nullable()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
