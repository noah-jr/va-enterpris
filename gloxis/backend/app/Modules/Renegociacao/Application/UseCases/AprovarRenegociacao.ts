import PagamentoModel from '#models/Pagamento'
import db from '@adonisjs/lucid/services/db'
import { SimuladorCreditoService } from '../../../SolicitacaoCredito/Domain/Services/SimuladorCreditoService.js'
import { ProdutoCredito } from '../../../ProdutoFinanceiro/Domain/Entities/ProdutoCredito.js'
import { DateTime } from 'luxon'

export class AprovarRenegociacao {
  constructor() {}

  public async execute(renegociacaoId: number, aprovadoPorUserId: number): Promise<void> {
    const trx = await db.transaction()

    try {
      const { default: RenegociacaoModel } = await import('#models/Renegociacao')
      const renegociacao = await RenegociacaoModel.findOrFail(renegociacaoId, { client: trx })

      if (renegociacao.status !== 'PENDENTE_APROVACAO')
        throw new Error('A renegociação não está pendente')

      // Marcar os antigos pagamentos pendentes/atrasados como cancelados (ou deletar)
      await PagamentoModel.query({ client: trx })
        .where('solicitacao_id', renegociacao.solicitacaoId)
        .whereIn('status', ['PENDENTE', 'ATRASADO'])
        .delete()

      // Gerar novas parcelas usando o simulador com a nova taxa
      const simulador = new SimuladorCreditoService()

      const mockProduto = new ProdutoCredito(
        0,
        'Renegociação Especial',
        'Produto especial para renegociação de dívidas',
        renegociacao.novaTaxaJuros / 100,
        1,
        999,
        0,
        999999999,
        true
      )

      const novoPlano = simulador.simular(
        mockProduto,
        renegociacao.novoSaldoDevedor,
        renegociacao.novasParcelas
      )

      // Inserir os novos pagamentos
      for (const parcela of novoPlano.cronograma) {
        const pag = new PagamentoModel()
        pag.solicitacaoId = renegociacao.solicitacaoId
        pag.numeroParcela = parcela.mes
        pag.valorParcela = parcela.valorParcela
        pag.valorPago = 0
        pag.metodo = 'TRANSFERENCIA'
        pag.status = 'PENDENTE'

        // Calculate new due date starting 1 month from now
        const dataVenc = new Date()
        dataVenc.setMonth(dataVenc.getMonth() + parcela.mes)
        pag.dataVencimento = DateTime.fromJSDate(dataVenc)

        pag.useTransaction(trx)
        await pag.save()
      }

      renegociacao.status = 'APROVADO'
      renegociacao.aprovadoPor = aprovadoPorUserId
      await renegociacao.save()

      await trx.commit()
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
