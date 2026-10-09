import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'solicitacao_documentos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('solicitacao_id')
        .unsigned()
        .references('id')
        .inTable('solicitacao_creditos')
        .onDelete('CASCADE')

      table.string('tipo_documento').notNullable() // e.g. 'BI', 'COMPROVATIVO_MORADA', 'EXTRATO_BANCARIO'
      table.string('file_path').notNullable() // URL / local path
      table.string('file_name').notNullable() // Original name
      table.string('content_type').notNullable() // MIME type
      table.integer('size').notNullable() // File size in bytes

      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
