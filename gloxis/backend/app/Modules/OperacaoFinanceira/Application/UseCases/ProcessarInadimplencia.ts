import { type IPagamentoRepository } from '../../Domain/Repositories/IPagamentoRepository.js'
import { AdicionarListaNegra } from '../../../ListaNegra/Application/UseCases/AdicionarListaNegra.js'
import db from '@adonisjs/lucid/services/db'

const DIAS_LISTA_NEGRA = 90 // Inclusão automática após 90 dias de atraso

export class ProcessarInadimplencia {
  private MULTA_FIXA_PERCENTUAL = 0.05 // 5% de multa
  private JUROS_MORA_DIARIO = 0.005 // 0.5% ao dia

  constructor(private pagamentoRepo: IPagamentoRepository) {}

  async execute(
    dataBase: Date = new Date()
  ): Promise<{ processados: number; adicionadosListaNegra: number }> {
    const pendentesAtrasados = await this.pagamentoRepo.findPendentesAtrasados(dataBase)

    if (pendentesAtrasados.length === 0) {
      return { processados: 0, adicionadosListaNegra: 0 }
    }

    const pagamentosAtualizados = []
    const clientesParaListaNegra = new Set<number>()

    for (const pagamento of pendentesAtrasados) {
      const msPorDia = 1000 * 60 * 60 * 24
      const diasAtraso = Math.floor(
        (dataBase.getTime() - pagamento.dataVencimento.getTime()) / msPorDia
      )

      if (diasAtraso > 0) {
        // Calculate Multa (applied once)
        if (pagamento.valorMulta === 0) {
          pagamento.valorMulta =
            Math.round(pagamento.valorPago * this.MULTA_FIXA_PERCENTUAL * 100) / 100
        }

        // Calculate Juros Mora (accumulated daily)
        pagamento.valorJurosMora =
          Math.round(pagamento.valorPago * this.JUROS_MORA_DIARIO * diasAtraso * 100) / 100

        pagamento.status = 'ATRASADO'
        pagamentosAtualizados.push(pagamento)

        // Flag for Lista Negra if overdue > 90 days
        if (diasAtraso >= DIAS_LISTA_NEGRA) {
          // Get the clienteId via the solicitacao
          const solicitacao = await db
            .from('solicitacao_creditos')
            .where('id', pagamento.solicitacaoId)
            .select('cliente_id')
            .first()
          if (solicitacao?.cliente_id) {
            clientesParaListaNegra.add(solicitacao.cliente_id)
          }
        }
      }
    }

    await this.pagamentoRepo.updateBatch(pagamentosAtualizados)

    // Auto-add to Lista Negra
    const adicionarListaNegra = new AdicionarListaNegra()
    let adicionadosListaNegra = 0
    for (const clienteId of clientesParaListaNegra) {
      await adicionarListaNegra.execute({
        clienteId,
        motivo: `Inclusão automática: cliente com parcelas em atraso há mais de ${DIAS_LISTA_NEGRA} dias.`,
      })
      adicionadosListaNegra++
    }

    return { processados: pagamentosAtualizados.length, adicionadosListaNegra }
  }
}
