import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pagamentos'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('comprovativo_reembolso_path').nullable() // Upload do cliente
      table.text('notas').nullable() // Observações admin/cliente
      table.integer('aprovado_por_id').unsigned().nullable() // Admin que validou o pagamento
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('comprovativo_reembolso_path')
      table.dropColumn('notas')
      table.dropColumn('aprovado_por_id')
    })
  }
}
