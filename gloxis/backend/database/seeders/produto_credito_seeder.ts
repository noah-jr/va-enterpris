import { BaseSeeder } from '@adonisjs/lucid/seeders'
import ProdutoCredito from '#models/ProdutoCredito'

export default class extends BaseSeeder {
  async run() {
    await ProdutoCredito.createMany([
      {
        nome: 'Microcrédito Empreendedor (Popular)',
        descricao: 'Crédito voltado para pequenos negócios informais.',
        taxaJurosMensal: 0.05, // 5%
        prazoMinimoMeses: 3,
        prazoMaximoMeses: 12,
        valorMinimo: 50000,
        valorMaximo: 1000000,
        ativo: true,
      },
      {
        nome: 'Crédito Pessoal (Funcionário Público)',
        descricao: 'Crédito com taxas reduzidas para servidores.',
        taxaJurosMensal: 0.035, // 3.5%
        prazoMinimoMeses: 6,
        prazoMaximoMeses: 60,
        valorMinimo: 100000,
        valorMaximo: 5000000,
        ativo: true,
      },
    ])
  }
}
