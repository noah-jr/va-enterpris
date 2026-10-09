import { type IPagamentoRepository } from '../../Domain/Repositories/IPagamentoRepository.js'
import { type Pagamento } from '../../Domain/Entities/Pagamento.js'
import ClassificacaoClienteModel from '../../../../models/classificacao_cliente.js'
import db from '@adonisjs/lucid/services/db'

export class ProcessarPagamento {
  constructor(private pagamentoRepo: IPagamentoRepository) {}

  async execute(payload: {
    solicitacaoId: number
    numeroParcela: number
    valorPago: number
    metodo: 'TRANSFERENCIA' | 'MULTICAIXA' | 'DINHEIRO'
    reciboPath: string | null
  }): Promise<Pagamento> {
    // Find all pagamentos for this solicitacao
    const pagamentos = await this.pagamentoRepo.findBySolicitacaoId(payload.solicitacaoId)
    const parcela = pagamentos.find((p) => p.numeroParcela === payload.numeroParcela)

    if (!parcela) {
      throw new Error(`Parcela ${payload.numeroParcela} não encontrada para a solicitação.`)
    }

    if (parcela.status === 'PROCESSADO') {
      throw new Error('Esta parcela já foi paga.')
    }

    if (payload.valorPago < parcela.valorPago) {
      throw new Error('O valor pago é menor que o valor da parcela.')
    }

    parcela.valorPago = payload.valorPago
    parcela.metodo = payload.metodo
    parcela.reciboPath = payload.reciboPath
    parcela.status = 'PROCESSADO'
    parcela.dataPagamento = new Date()

    const pagoAtualizado = await this.pagamentoRepo.update(parcela)

    // --- Trigger Classificação update after successful payment ---
    try {
      const solicitacao = await db
        .from('solicitacao_creditos')
        .where('id', payload.solicitacaoId)
        .select('cliente_id')
        .first()

      if (solicitacao?.cliente_id) {
        await this.atualizarClassificacao(solicitacao.cliente_id, payload.valorPago)

        // Enviar notificação de pagamento recebido
        try {
          const { NotificacaoService } =
            await import('../../../Notificacao/Application/Services/NotificacaoService.js')
          await NotificacaoService.enviar({
            tipo: 'SMS',
            destinatario: `cliente_${solicitacao.cliente_id}@sms.exemplo.com`,
            mensagem: `Confirmamos a recepção do seu pagamento de Kz ${payload.valorPago.toLocaleString('pt-AO')} (Parcela ${payload.numeroParcela}). Obrigado!`,
          })
        } catch (notifErr) {
          console.warn('[ProcessarPagamento] Falha ao enviar notificação de pagamento', notifErr)
        }
      }
    } catch (err) {
      // Silent fail — do not block the payment if classification update fails
      console.warn('[ProcessarPagamento] Falha ao atualizar classificação:', err)
    }

    return pagoAtualizado
  }

  private async atualizarClassificacao(clienteId: number, valorPago: number): Promise<void> {
    let classificacao = await ClassificacaoClienteModel.query()
      .where('cliente_id', clienteId)
      .first()

    if (!classificacao) {
      classificacao = await ClassificacaoClienteModel.create({
        clienteId,
        nivel: 'BRONZE',
        pontosFidelidade: 0,
        creditosPagosSucesso: 0,
        valorTotalPago: 0,
        diasMediosAtraso: 0,
      })
    }

    classificacao.creditosPagosSucesso += 1
    classificacao.valorTotalPago += valorPago
    classificacao.pontosFidelidade += 10 // 10 pontos por pagamento realizado

    // Progressão de Nível
    const pontos = classificacao.pontosFidelidade
    if (pontos >= 500) classificacao.nivel = 'PREMIUM'
    else if (pontos >= 200) classificacao.nivel = 'PLATINUM'
    else if (pontos >= 100) classificacao.nivel = 'OURO'
    else if (pontos >= 50) classificacao.nivel = 'PRATA'
    else classificacao.nivel = 'BRONZE'

    await classificacao.save()
  }
}
