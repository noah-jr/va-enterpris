import { BaseSeeder } from '@adonisjs/lucid/seeders'
import SolicitacaoCredito from '#models/SolicitacaoCredito'

export default class SolicitacaoCreditoSeeder extends BaseSeeder {
  public async run() {
    await SolicitacaoCredito.createMany([
      {
        clienteId: 1,
        valor: 5000.0,
        parcelas: 12,
        status: 'PENDENTE',
      },
      {
        clienteId: 2,
        valor: 12000.5,
        parcelas: 24,
        status: 'APROVADO',
      },
    ])
  }
}
