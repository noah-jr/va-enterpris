import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'
import crypto from 'node:crypto'
import { DateTime } from 'luxon'
import Fatura from '#models/fatura'
import { NotificacaoService } from '../app/Modules/Notificacao/Application/Services/NotificacaoService.js'
import emitter from '@adonisjs/core/services/emitter'

export default class GerarFaturasParcelas extends BaseCommand {
  static commandName = 'processar:faturas-parcelas'
  static description =
    'Gera faturas (Não Pago) e envia notificações para parcelas que vencem em 5 dias.'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info(
      'Iniciando processamento de geração de faturas e notificações para parcelas prestes a vencer...'
    )

    try {
      const now = new Date()
      const thresholdDate = new Date()
      thresholdDate.setDate(now.getDate() + 5) // Próximos 5 dias

      // Obter pagamentos pendentes cujo vencimento é até daqui a 5 dias
      const pagamentosPendentes = await db
        .from('pagamentos')
        .where('status', 'PENDENTE')
        .where('data_vencimento', '<=', thresholdDate)
        .where('data_vencimento', '>=', now)

      let count = 0
      for (const p of pagamentosPendentes) {
        // Verificar se já existe fatura gerada para esta parcela
        const refDescricao = `Fatura Parcela ${p.numero_parcela} - Crédito #${p.solicitacao_id}`

        const faturaExistente = await db
          .from('faturas')
          .where('itens_json', 'LIKE', `%${refDescricao}%`)
          .first()

        if (!faturaExistente) {
          // Obter dados do cliente
          const solicitacao = await db
            .from('solicitacao_creditos')
            .where('id', p.solicitacao_id)
            .first()
          if (!solicitacao) continue

          const cliente = await db.from('clientes').where('id', solicitacao.cliente_id).first()
          if (!cliente) continue

          // Gerar Fatura Não Paga
          const hashDummy = crypto
            .createHash('sha256')
            .update(`${Date.now()}-${p.valor_parcela}`)
            .digest('hex')
            .substring(0, 16)
            .toUpperCase()

          await Fatura.create({
            clienteId: cliente.id,
            clienteNome: cliente.nome,
            clienteNif: cliente.nif || '000000000',
            tipoDocumento: 'FT', // Fatura (Não Pago)
            valor: p.valor_parcela,
            valorImposto: 0,
            valorRetencao: 0,
            status: 'PENDENTE', // "Não Pago"
            hashAgt: hashDummy,
            itensJson: JSON.stringify([{ descricao: refDescricao, valor: p.valor_parcela }]),
            dataVencimento: DateTime.fromJSDate(new Date(p.data_vencimento)),
          })

          // Notificar o Cliente via NotificacaoService (SMS/Email) e Tempo Real
          await NotificacaoService.enviar({
            tipo: 'EMAIL',
            destinatario: cliente.email || `cliente_${cliente.id}@exemplo.com`,
            mensagem: `Aviso: A parcela ${p.numero_parcela} do seu crédito de Kz ${Number(p.valor_parcela).toLocaleString('pt-AO')} vence no dia ${new Date(p.data_vencimento).toLocaleDateString('pt-AO')}. Por favor, anexe o comprovativo de pagamento na plataforma.`,
          })

          // @ts-ignore
          emitter.emit('notificacao:realtime', {
            tipo: 'PARCELA_A_VENCER',
            titulo: 'Fatura de Parcela Gerada',
            mensagem: `A parcela ${p.numero_parcela} do Crédito #${p.solicitacao_id} vence no dia ${new Date(p.data_vencimento).toLocaleDateString('pt-AO')}. A Fatura (Não Paga) já foi gerada na sua contabilidade.`,
            destinatarioId: cliente.user_id,
            destinatario_nome: cliente.nome,
            pagamentoId: p.id,
          })

          count++
        }
      }

      this.logger.success(`Processamento concluído. ${count} faturas/notificações geradas.`)
    } catch (error) {
      this.logger.error(`Erro ao processar faturas: ${(error as Error).message}`)
    }
  }
}
