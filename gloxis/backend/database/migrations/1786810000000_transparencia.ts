import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected metricasTable = 'transparencia_metricas'
  protected documentosTable = 'transparencia_documentos'

  async up() {
    this.schema.createTable(this.metricasTable, (table) => {
      table.increments('id')
      table.string('chave').notNullable().unique()
      table.string('label').notNullable()
      table.string('val').notNullable()
      table.integer('ordem').defaultTo(0)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    this.schema.createTable(this.documentosTable, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.string('date').notNullable()
      table.string('size').nullable()
      table.string('categoria').defaultTo('Normativo')
      table.string('file_url').notNullable()
      table.integer('ordem').defaultTo(0)
      table.boolean('ativo').defaultTo(true)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.documentosTable)
    this.schema.dropTable(this.metricasTable)
  }
}
