import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Cliente from '#models/Cliente'
import User from '#models/user'

const DEFAULT_PASSWORD = '12345678'

const clientesData = [
  {
    nome: 'Maria Silva',
    nif: '123456789',
    email: 'maria.silva@exemplo.com',
    telefone: '923000001',
    documentos: JSON.stringify([]),
    endereco: JSON.stringify({ rua: 'Av. Central', numero: 100 }),
    contaBancaria: JSON.stringify({ banco: 'Banco X', agencia: '0001', conta: '12345-6' }),
    mustChangePassword: true, // Primeiro cliente obrigado a trocar senha
  },
  {
    nome: 'João Santos',
    nif: '987654321',
    email: 'joao.santos@exemplo.com',
    telefone: '923000002',
    documentos: JSON.stringify([]),
    endereco: JSON.stringify({ rua: 'Rua das Flores', numero: 45 }),
    contaBancaria: JSON.stringify({ banco: 'Banco Y', agencia: '0022', conta: '98765-4' }),
    mustChangePassword: false,
  },
  {
    nome: 'Ana Ferreira',
    nif: '456789123',
    email: 'ana.ferreira@exemplo.com',
    telefone: '923000003',
    documentos: JSON.stringify([]),
    endereco: JSON.stringify({ rua: 'Rua da Paz', numero: 12 }),
    contaBancaria: JSON.stringify({ banco: 'Banco Z', agencia: '0033', conta: '11223-5' }),
    mustChangePassword: false,
  },
]

export default class ClienteSeeder extends BaseSeeder {
  public async run() {
    const hashedPassword = DEFAULT_PASSWORD // raw — o beforeSave do User faz o hash

    for (const clienteData of clientesData) {
      const { mustChangePassword, email, nome, ...restCliente } = clienteData

      // Cria ou encontra o utilizador associado
      let user = await User.findBy('email', email)
      if (!user) {
        user = await User.create({
          fullName: nome,
          email,
          password: hashedPassword,
          role: 'CLIENTE',
          mustChangePassword,
        })
      }

      // Cria ou actualiza o perfil de cliente, vinculando ao userId
      await Cliente.updateOrCreate(
        { nif: restCliente.nif },
        {
          nome,
          email,
          userId: user.id,
          ...restCliente,
        }
      )
    }
  }
}
