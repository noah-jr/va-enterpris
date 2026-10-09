import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    await User.updateOrCreateMany('email', [
      {
        fullName: 'Administrador Supremo',
        email: 'admin@gloxis.com',
        password: 'password123',
        role: 'ADMIN',
      },
      {
        fullName: 'Gestor de Crédito',
        email: 'gestor@gloxis.com',
        password: 'password123',
        role: 'GESTOR',
      },
      {
        fullName: 'Diretor Financeiro',
        email: 'diretor@gloxis.com',
        password: 'password123',
        role: 'DIRETOR',
      },
    ])
  }
}
