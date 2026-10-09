import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'funcionarios'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('departamento').defaultTo('TI & ENGENHARIA')
      table.string('nif').nullable()
      table.string('iban').nullable()
      table.string('status').defaultTo('ATIVO')
      table.decimal('subsidio_alimentacao', 12, 2).defaultTo(30000)
      table.decimal('subsidio_transporte', 12, 2).defaultTo(25000)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('departamento')
      table.dropColumn('nif')
      table.dropColumn('iban')
      table.dropColumn('status')
      table.dropColumn('subsidio_alimentacao')
      table.dropColumn('subsidio_transporte')
    })
  }
}
