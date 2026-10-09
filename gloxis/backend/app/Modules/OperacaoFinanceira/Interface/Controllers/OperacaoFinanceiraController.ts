import type { HttpContext } from '@adonisjs/core/http'
import { RealizarDesembolso } from '../../Application/UseCases/RealizarDesembolso.js'
import { ProcessarPagamento } from '../../Application/UseCases/ProcessarPagamento.js'
import { DesembolsoRepositoryImpl } from '../../Infrastructure/Repositories/DesembolsoRepositoryImpl.js'
import { PagamentoRepositoryImpl } from '../../Infrastructure/Repositories/PagamentoRepositoryImpl.js'
import { SolicitacaoCreditoRepositoryImpl } from '../../../SolicitacaoCredito/Infrastructure/Repositories/SolicitacaoCreditoRepositoryImpl.js'
import { ProdutoCreditoRepositoryImpl } from '../../../ProdutoFinanceiro/Infrastructure/Repositories/ProdutoCreditoRepositoryImpl.js'
import db from '@adonisjs/lucid/services/db'
import emitter from '@adonisjs/core/services/emitter'
import app from '@adonisjs/core/services/app'

export default class OperacaoFinanceiraController {
  /**
   * Admin: desembolsa um crédito aprovado e anexa o comprovativo de transferência.
   * POST /operacoes/desembolsos  (multipart/form-data)
   */
  public async desembolsar({ request, response, auth }: HttpContext) {
    const solicitacaoId = Number(request.input('solicitacaoId'))
    const metodo = request.input('metodo', 'TRANSFERENCIA')

    // Upload de comprovativo (obrigatório para TRANSFERENCIA)
    let comprovantePath: string | null = null
    const comprovanteFile = request.file('comprovativo', {
      size: '10mb',
      extnames: ['pdf', 'jpg', 'jpeg', 'png'],
    })
    if (comprovanteFile) {
      await comprovanteFile.move('public/uploads/comprovativos')
      comprovantePath = `/uploads/comprovativos/${comprovanteFile.fileName}`
    }

    if (metodo === 'TRANSFERENCIA' && !comprovantePath) {
      return response.badRequest({
        error:
          'O comprovativo de transferência é obrigatório para desembolsos por transferência bancária.',
      })
    }

    const useCase = new RealizarDesembolso(
      new DesembolsoRepositoryImpl(),
      new SolicitacaoCreditoRepositoryImpl(),
      new ProdutoCreditoRepositoryImpl(),
      new PagamentoRepositoryImpl()
    )

    try {
      const result = await useCase.execute(solicitacaoId, metodo, comprovantePath)

      // Persiste o comprovativo e datas na solicitação
      const now = new Date()
      const solicitacao = await db.from('solicitacao_creditos').where('id', solicitacaoId).first()
      const dataFim = new Date(now)
      dataFim.setMonth(dataFim.getMonth() + (solicitacao?.parcelas || 1))

      await db.from('solicitacao_creditos').where('id', solicitacaoId).update({
        comprovativo_desembolso_path: comprovantePath,
        data_aprovacao: now,
        data_inicio_pagamento: now,
        data_vencimento_final: dataFim,
        status: 'APROVADO',
      })

      // Gerar Fatura de Desembolso (Pago)
      const Fatura = (await import('#models/fatura')).default
      const crypto = (await import('node:crypto')).default
      const { DateTime } = await import('luxon')
      const hashDummy = crypto
        .createHash('sha256')
        .update(`${Date.now()}-${solicitacao?.valor}`)
        .digest('hex')
        .substring(0, 16)
        .toUpperCase()

      const clienteData = await db.from('clientes').where('id', solicitacao?.cliente_id).first()
      const clienteNif = clienteData?.nif || '000000000'
      const clienteNome = clienteData?.nome || 'Cliente'

      await Fatura.create({
        clienteId: solicitacao?.cliente_id,
        clienteNome,
        clienteNif,
        tipoDocumento: 'RC', // Recibo
        valor: solicitacao?.valor,
        valorImposto: 0,
        valorRetencao: 0,
        status: 'PAGA', // Recebido
        hashAgt: hashDummy,
        itensJson: JSON.stringify([
          { descricao: `Desembolso de Crédito #${solicitacaoId}`, valor: solicitacao?.valor },
        ]),
        dataVencimento: DateTime.now(),
      })

      // Notificar cliente em tempo real via SSE
      if (clienteData) {
        // @ts-ignore
        emitter.emit('notificacao:realtime', {
          tipo: 'DESEMBOLSO_REALIZADO',
          titulo: 'Crédito Desembolsado!',
          mensagem: `O seu crédito de Kz ${Number(solicitacao?.valor || 0).toLocaleString('pt-AO')} foi desembolsado. O comprovativo está disponível na área de Meus Créditos.`,
          destinatarioId: clienteData.user_id,
          destinatario_nome: clienteData.nome,
          comprovativePath: comprovantePath,
          solicitacaoId,
        })
      }

      const { AuditLogService } =
        await import('../../../Core/Infrastructure/Services/AuditLogService.js')
      await AuditLogService.log({
        userId: auth.user?.id,
        acao: 'DESEMBOLSO_EFETUADO',
        entidade: 'SOLICITACAO_CREDITO',
        entidadeId: solicitacaoId,
        detalhes: { valor: solicitacao?.valor, comprovantePath },
      })

      return response.created({ message: 'Desembolso realizado com sucesso.', data: result })
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }

  /**
   * Lista todos os pagamentos/parcelas com filtros e paginação.
   * GET /operacoes/pagamentos
   */
  public async listarPagamentos({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('perPage', 10)
      const search = request.input('search')
      const status = request.input('status')

      let query = db
        .from('pagamentos')
        .leftJoin('solicitacao_creditos', 'pagamentos.solicitacao_id', 'solicitacao_creditos.id')
        .leftJoin('clientes', 'solicitacao_creditos.cliente_id', 'clientes.id')
        .select('pagamentos.*', 'clientes.nome as cliente_nome', 'clientes.nif as cliente_nif')
        .orderBy('pagamentos.data_vencimento', 'asc')

      if (search) {
        query.where((q) => {
          q.where('clientes.nome', 'LIKE', `%${search}%`)
            .orWhere('clientes.nif', 'LIKE', `%${search}%`)
            .orWhere('pagamentos.solicitacao_id', 'LIKE', `%${search}%`)
        })
      }

      if (status && status !== '' && status !== 'TODOS') {
        query.where('pagamentos.status', status)
      }

      const paginated = await query.paginate(page, perPage)
      const json = paginated.toJSON()

      json.data = json.data.map((item) => ({
        id: item.id,
        solicitacaoId: item.solicitacao_id,
        numeroParcela: item.numero_parcela,
        valorParcela: Number(item.valor_parcela || 0),
        dataVencimento: item.data_vencimento,
        status: item.status,
        dataPagamento: item.data_pagamento,
        valorPago: item.valor_pago ? Number(item.valor_pago) : null,
        metodo: item.metodo,
        reciboPath: item.recibo_path,
        comprativoReembolsoPath: item.comprovativo_reembolso_path,
        notas: item.notas,
        solicitacao: {
          cliente: {
            nome: item.cliente_nome || 'Mutuário Gloxis',
            nif: item.cliente_nif || '000000000',
          },
        },
      }))

      return response.ok(json)
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  /**
   * Cliente: submete comprovativo de reembolso de uma parcela.
   * POST /operacoes/reembolsos  (multipart/form-data)
   */
  public async submeterReembolso({ request, response }: HttpContext) {
    const pagamentoId = Number(request.input('pagamentoId'))
    const metodo = request.input('metodo', 'TRANSFERENCIA')
    const notas = request.input('notas', '')

    if (!pagamentoId) {
      return response.badRequest({ error: 'pagamentoId é obrigatório.' })
    }

    // Upload obrigatório do comprovativo
    const comprovanteFile = request.file('comprovativo', {
      size: '10mb',
      extnames: ['pdf', 'jpg', 'jpeg', 'png'],
    })

    if (!comprovanteFile) {
      return response.badRequest({ error: 'O comprovativo de reembolso é obrigatório.' })
    }

    await comprovanteFile.move('public/uploads/comprovativos')
    const comprovantePath = `/uploads/comprovativos/${comprovanteFile.fileName}`

    try {
      const pagamento = await db.from('pagamentos').where('id', pagamentoId).first()
      if (!pagamento) {
        return response.notFound({ error: 'Parcela não encontrada.' })
      }
      if (pagamento.status === 'PROCESSADO') {
        return response.badRequest({ error: 'Esta parcela já foi processada.' })
      }

      // Atualiza a parcela como PENDENTE de validação (admin ainda vai confirmar)
      await db.from('pagamentos').where('id', pagamentoId).update({
        comprovativo_reembolso_path: comprovantePath,
        metodo: metodo,
        notas: notas,
        status: 'PENDENTE', // Admin irá validar e mudar para PROCESSADO
        updated_at: new Date(),
      })

      // Notificar admin em tempo real
      // @ts-ignore
      emitter.emit('notificacao:realtime', {
        tipo: 'REEMBOLSO_SUBMETIDO',
        titulo: 'Reembolso Submetido',
        mensagem: `Cliente submeteu comprovativo da parcela #${pagamento.numero_parcela} da solicitação #${pagamento.solicitacao_id}.`,
        broadcast: false,
        destinatarioRole: 'ADMIN',
        pagamentoId,
        comprovativePath: comprovantePath,
      })

      return response.ok({
        message: 'Comprovativo de reembolso submetido com sucesso. Aguarde a validação do gestor.',
        data: { comprovantePath },
      })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  /**
   * Admin: valida/confirma o pagamento de uma parcela.
   * PATCH /operacoes/pagamentos/:id/validar
   */
  public async validarPagamento({ params, request, response, auth }: HttpContext) {
    const pagamentoId = params.id
    const { status, notas } = request.only(['status', 'notas'])

    if (!['PROCESSADO', 'REJEITADO'].includes(status)) {
      return response.badRequest({ error: 'Status inválido. Use PROCESSADO ou REJEITADO.' })
    }

    try {
      const pagamento = await db.from('pagamentos').where('id', pagamentoId).first()
      if (!pagamento) return response.notFound({ error: 'Parcela não encontrada.' })

      await db
        .from('pagamentos')
        .where('id', pagamentoId)
        .update({
          status,
          notas: notas || pagamento.notas,
          aprovado_por_id: auth.user!.id,
          data_pagamento: status === 'PROCESSADO' ? new Date() : null,
          updated_at: new Date(),
        })

      if (status === 'PROCESSADO') {
        const refDescricao = `Fatura Parcela ${pagamento.numero_parcela} - Crédito #${pagamento.solicitacao_id}`
        await db.from('faturas').where('itens_json', 'LIKE', `%${refDescricao}%`).update({
          status: 'PAGA',
          updated_at: new Date(),
        })
      }

      // Atualizar status da solicitação se todas as parcelas foram pagas
      const [{ total, processadas }] = await db
        .from('pagamentos')
        .where('solicitacao_id', pagamento.solicitacao_id)
        .select(
          db.raw('COUNT(*) as total'),
          db.raw("SUM(CASE WHEN status = 'PROCESSADO' THEN 1 ELSE 0 END) as processadas")
        )

      if (Number(total) > 0 && Number(processadas) >= Number(total)) {
        await db.from('solicitacao_creditos').where('id', pagamento.solicitacao_id).update({
          status: 'APROVADO', // Manter aprovado — crédito totalmente liquidado seria novo estado
        })
      }

      // Notificar cliente
      const solicitacao = await db
        .from('solicitacao_creditos')
        .where('id', pagamento.solicitacao_id)
        .first()
      const clienteData = solicitacao
        ? await db.from('clientes').where('id', solicitacao.cliente_id).first()
        : null
      if (clienteData) {
        const msg =
          status === 'PROCESSADO'
            ? `O seu reembolso da parcela #${pagamento.numero_parcela} foi validado e confirmado.`
            : `O seu comprovativo da parcela #${pagamento.numero_parcela} foi rejeitado. Por favor, reenvie.`

        // @ts-ignore
        emitter.emit('notificacao:realtime', {
          tipo: status === 'PROCESSADO' ? 'REEMBOLSO_VALIDADO' : 'REEMBOLSO_REJEITADO',
          titulo: status === 'PROCESSADO' ? 'Pagamento Confirmado' : 'Comprovativo Rejeitado',
          mensagem: msg,
          destinatarioId: clienteData.user_id,
          destinatario_nome: clienteData.nome,
          pagamentoId,
        })
      }

      const { AuditLogService } =
        await import('../../../Core/Infrastructure/Services/AuditLogService.js')
      await AuditLogService.log({
        userId: auth.user?.id,
        acao:
          status === 'PROCESSADO' ? 'PAGAMENTO_PARCELA_VALIDADO' : 'PAGAMENTO_PARCELA_REJEITADO',
        entidade: 'PAGAMENTO_PARCELA',
        entidadeId: pagamentoId,
        detalhes: { status, notas },
      })

      return response.ok({
        message: `Pagamento ${status === 'PROCESSADO' ? 'validado' : 'rejeitado'} com sucesso.`,
      })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  /**
   * Retorna as parcelas de uma solicitação com timeline completa.
   * GET /operacoes/solicitacoes/:id/parcelas
   */
  public async listarParcelas({ params, response }: HttpContext) {
    try {
      const solicitacaoId = params.id
      const [solicitacao] = await db
        .from('solicitacao_creditos')
        .leftJoin('desembolsos', 'desembolsos.solicitacao_id', 'solicitacao_creditos.id')
        .where('solicitacao_creditos.id', solicitacaoId)
        .select(
          'solicitacao_creditos.*',
          'desembolsos.comprovante_path as comprovativo_desembolso_db'
        )
        .limit(1)

      const faturaDesembolso = await db
        .from('faturas')
        .where('cliente_id', solicitacao?.cliente_id)
        .where('itens_json', 'LIKE', `%Desembolso de Crédito #${solicitacaoId}%`)
        .orderBy('created_at', 'desc')
        .first()

      const faturaSolicitacao = await db
        .from('faturas')
        .where('cliente_id', solicitacao?.cliente_id)
        .where('itens_json', 'LIKE', `%Solicitação de Crédito #${solicitacaoId}%`)
        .orderBy('created_at', 'desc')
        .first()

      if (!solicitacao) return response.notFound({ error: 'Solicitação não encontrada.' })

      const parcelas = await db
        .from('pagamentos')
        .where('solicitacao_id', solicitacaoId)
        .orderBy('numero_parcela', 'asc')

      const now = new Date()
      const dataFim = solicitacao.data_vencimento_final
        ? new Date(solicitacao.data_vencimento_final)
        : null
      const dataInicio = solicitacao.data_inicio_pagamento
        ? new Date(solicitacao.data_inicio_pagamento)
        : null

      // Calcular progresso temporal
      let progressoTempo = 0
      if (dataInicio && dataFim) {
        const total = dataFim.getTime() - dataInicio.getTime()
        const decorrido = Math.min(now.getTime() - dataInicio.getTime(), total)
        progressoTempo = Math.max(0, Math.min(100, (decorrido / total) * 100))
      }

      const todasFaturasCliente = await db
        .from('faturas')
        .where('cliente_id', solicitacao?.cliente_id)
        .where('itens_json', 'LIKE', `%Crédito #${solicitacaoId}%`)

      const parcelasEnriquecidas = parcelas.map((p: Record<string, unknown>) => {
        const vencimento = new Date(String(p.data_vencimento))
        const diasRestantes = Math.ceil(
          (vencimento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        const refDescricao = `Fatura Parcela ${p.numero_parcela} - Crédito #${p.solicitacao_id}`
        const fatura = todasFaturasCliente.find((f: Record<string, unknown>) =>
          String(f.itens_json || '').includes(refDescricao)
        )

        const valorBase = Number(p.valor_parcela || p.valor_pago || 0)
        const isAtrasada = diasRestantes < 0 && p.status !== 'PROCESSADO'
        const diasAtraso = isAtrasada ? Math.abs(diasRestantes) : 0
        const valorJurosMora = isAtrasada
          ? Math.round(valorBase * 0.005 * diasAtraso)
          : Number(p.valor_juros_mora || 0)
        const valorMulta = Number(p.valor_multa || 0)
        const valorTotalAtualizado = valorBase + valorJurosMora + valorMulta

        return {
          id: p.id,
          numeroParcela: p.numero_parcela,
          valorParcela: valorBase,
          valorPago: p.valor_pago ? Number(p.valor_pago) : null,
          valorJurosMora,
          valorMulta,
          valorTotalAtualizado,
          status: p.status,
          dataVencimento: p.data_vencimento,
          dataPagamento: p.data_pagamento,
          metodo: p.metodo,
          reciboPath: p.recibo_path,
          comprativoReembolsoPath: p.comprovativo_reembolso_path,
          notas: p.notas,
          diasRestantes,
          atrasada: isAtrasada,
          faturaParcelaId: fatura?.id || null,
        }
      })

      return response.ok({
        data: {
          solicitacao: {
            id: solicitacao.id,
            valor: Number(solicitacao.valor),
            parcelas: solicitacao.parcelas,
            status: solicitacao.status,
            finalidade: solicitacao.finalidade,
            dataAprovacao: solicitacao.data_aprovacao,
            dataInicioPagamento: solicitacao.data_inicio_pagamento,
            dataVencimentoFinal: solicitacao.data_vencimento_final,
            comprovativoDesembolsoPath:
              solicitacao.comprovativo_desembolso_path || solicitacao.comprovativo_desembolso_db,
            faturaDesembolsoId: faturaDesembolso?.id,
            faturaSolicitacaoId: faturaSolicitacao?.id,
            progressoTempo: Math.round(progressoTempo),
            diasParaFim: dataFim
              ? Math.ceil((dataFim.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
              : null,
          },
          parcelas: parcelasEnriquecidas,
          resumo: {
            totalParcelas: parcelasEnriquecidas.length,
            parcelasPagas: parcelasEnriquecidas.filter((p) => p.status === 'PROCESSADO').length,
            parcelasPendentes: parcelasEnriquecidas.filter((p) => p.status === 'PENDENTE').length,
            parcelasAtrasadas: parcelasEnriquecidas.filter((p) => p.atrasada).length,
            totalPago: parcelasEnriquecidas
              .filter((p) => p.status === 'PROCESSADO')
              .reduce((s, p) => s + (p.valorPago || 0), 0),
            totalEmAberto: parcelasEnriquecidas
              .filter((p) => p.status !== 'PROCESSADO')
              .reduce((s, p) => s + p.valorParcela, 0),
          },
        },
      })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  // (manter pagarParcela para compatibilidade — admin pode usar também)
  public async pagarParcela({ request, response }: HttpContext) {
    const data = request.only([
      'solicitacaoId',
      'numeroParcela',
      'valorPago',
      'metodo',
      'valorJurosMora',
      'valorMulta',
    ])

    let reciboPath: string | null = null
    const file = request.file('comprovativo', {
      size: '5mb',
      extnames: ['jpg', 'png', 'jpeg', 'pdf'],
    })

    if (file) {
      const fileName = `${new Date().getTime()}_${file.clientName}`
      await file.move(app.makePath('public/uploads/recibos'), { name: fileName })
      reciboPath = `/uploads/recibos/${fileName}`
    }

    const useCase = new ProcessarPagamento(new PagamentoRepositoryImpl())
    try {
      const result = await useCase.execute({
        solicitacaoId: Number(data.solicitacaoId),
        numeroParcela: Number(data.numeroParcela),
        valorPago: Number(data.valorPago),
        metodo: (data.metodo || 'DINHEIRO') as any,
        reciboPath: reciboPath,
      })
      return response.created({ message: 'Pagamento processado com sucesso.', data: result })
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }
}
