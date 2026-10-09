import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // 2FA Fields
      table.string('two_factor_secret').nullable()
      table.boolean('two_factor_enabled').defaultTo(false)

      // Password Reset
      table.string('reset_password_token').nullable()
      table.timestamp('reset_password_expires').nullable()
    })

    this.schema.createTable('api_keys', (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('key').notNullable().unique()
      table.string('name').notNullable()
      table.timestamp('last_used_at').nullable()
      table.timestamp('revoked_at').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable('api_keys')

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('two_factor_secret')
      table.dropColumn('two_factor_enabled')
      table.dropColumn('reset_password_token')
      table.dropColumn('reset_password_expires')
    })
  }
}
