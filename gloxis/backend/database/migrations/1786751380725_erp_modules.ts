import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  public async up() {
    this.schema.createTable('vendas', (table) => {
      table.increments('id')
      table.integer('cliente_id').unsigned()
      table.decimal('valor', 12, 2)
      table.string('status').defaultTo('PENDENTE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('compras', (table) => {
      table.increments('id')
      table.integer('fornecedor_id').unsigned()
      table.decimal('valor', 12, 2)
      table.string('status').defaultTo('PENDENTE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('stock_items', (table) => {
      table.increments('id')
      table.integer('produto_id').unsigned()
      table.integer('quantidade').defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('faturas', (table) => {
      table.increments('id')
      table.integer('cliente_id').unsigned()
      table.decimal('valor', 12, 2)
      table.string('status').defaultTo('EMITIDA')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('lancamentos_contabeis', (table) => {
      table.increments('id')
      table.string('conta')
      table.decimal('valor', 12, 2)
      table.string('tipo') // DEBITO, CREDITO
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('funcionarios', (table) => {
      table.increments('id')
      table.string('nome')
      table.string('cargo')
      table.decimal('salario', 12, 2)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('contratos', (table) => {
      table.increments('id')
      table.string('titulo')
      table.string('status').defaultTo('ATIVO')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('projetos', (table) => {
      table.increments('id')
      table.string('nome')
      table.decimal('orcamento', 12, 2)
      table.string('status').defaultTo('EM_ANDAMENTO')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('ativos', (table) => {
      table.increments('id')
      table.string('nome')
      table.decimal('valor', 12, 2)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('documentos', (table) => {
      table.increments('id')
      table.string('titulo')
      table.string('caminho')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  public async down() {
    this.schema.dropTable('vendas')
    this.schema.dropTable('compras')
    this.schema.dropTable('stock_items')
    this.schema.dropTable('faturas')
    this.schema.dropTable('lancamentos_contabeis')
    this.schema.dropTable('funcionarios')
    this.schema.dropTable('contratos')
    this.schema.dropTable('projetos')
    this.schema.dropTable('ativos')
    this.schema.dropTable('documentos')
  }
}
