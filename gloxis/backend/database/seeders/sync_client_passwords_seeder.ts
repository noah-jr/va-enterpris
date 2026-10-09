import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

/**
 * Seeder de Sincronização de Passwords de Clientes
 *
 * Garante que TODOS os utilizadores com role=CLIENTE tenham:
 * - Password padrão: 12345678 (já encriptada)
 * - O primeiro cliente (ordenado por id) com mustChangePassword = true
 * - Os restantes com mustChangePassword = false
 */
export default class SyncClientPasswordsSeeder extends BaseSeeder {
  async run() {
    const DEFAULT_PASSWORD = '12345678'
    // NÃO fazer hash manual — o hook @beforeSave do modelo User faz isso automaticamente

    // Buscar todos os clientes ordenados por id
    const allClients = await User.query().where('role', 'CLIENTE').orderBy('id', 'asc')

    if (allClients.length === 0) {
      console.log('[SyncClientPasswords] Nenhum cliente encontrado.')
      return
    }

    console.log(`[SyncClientPasswords] Sincronizando ${allClients.length} cliente(s)...`)

    for (const [i, user] of allClients.entries()) {
      user.password = DEFAULT_PASSWORD // raw — o beforeSave faz o hash
      // Primeiro cliente (menor ID) é forçado a trocar senha
      user.mustChangePassword = i === 0
      await user.save()
      console.log(`  → ${user.email} | mustChangePassword: ${user.mustChangePassword}`)
    }

    console.log('[SyncClientPasswords] Concluído! Senha padrão: 12345678')
  }
}
