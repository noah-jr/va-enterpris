import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  public async up() {
    // 1. Atualizar tabela documentos com campos de classificação e tramitação
    this.schema.alterTable('documentos', (table) => {
      table.string('categoria').defaultTo('OUTRO')
      table.string('departamento').defaultTo('GERAL')
      table.string('status').defaultTo('PENDENTE')
      table.string('cliente_nome').nullable()
      table.string('cliente_email').nullable()
      table.text('notas').nullable()
    })

    // 2. Criar tabela de histórico de tramitações do documento
    this.schema.createTable('tramitacoes_documento', (table) => {
      table.increments('id')
      table.integer('documento_id').unsigned().notNullable()
      table.string('origem').notNullable()
      table.string('destino').notNullable()
      table.text('despacho').nullable()
      table.string('usuario').defaultTo('Sistema')
      table.string('status_anterior').defaultTo('PENDENTE')
      table.string('status_novo').defaultTo('EM_ANALISE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // 3. Criar tabela de Inbox de Comunicação Interna & Cliente
    this.schema.createTable('mensagens_inbox', (table) => {
      table.increments('id')
      table.integer('remetente_id').unsigned().nullable()
      table.string('remetente_nome').notNullable()
      table.string('remetente_tipo').defaultTo('ADMIN') // ADMIN ou CLIENTE
      table.integer('destinatario_id').unsigned().nullable()
      table.string('destinatario_nome').notNullable()
      table.string('destinatario_tipo').defaultTo('CLIENTE') // ADMIN ou CLIENTE
      table.string('assunto').notNullable()
      table.text('conteudo').notNullable()
      table.integer('documento_id').unsigned().nullable()
      table.boolean('lida').defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  public async down() {
    this.schema.dropTable('mensagens_inbox')
    this.schema.dropTable('tramitacoes_documento')
    this.schema.alterTable('documentos', (table) => {
      table.dropColumn('categoria')
      table.dropColumn('departamento')
      table.dropColumn('status')
      table.dropColumn('cliente_nome')
      table.dropColumn('cliente_email')
      table.dropColumn('notas')
    })
  }
}
