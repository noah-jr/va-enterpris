import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'clientes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_lista_negra').defaultTo(false)
      table.enum('classificacao', ['NOVO', 'BRONZE', 'PRATA', 'OURO']).defaultTo('NOVO')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_lista_negra')
      table.dropColumn('classificacao')
    })
  }
}
