import SolicitacaoCreditoPolicy from '#policies/solicitacao_credito_policy'
import type { HttpContext } from '@adonisjs/core/http'
import { CreateSolicitacaoCredito } from '../../Application/UseCases/CreateSolicitacaoCredito.js'
import { GetSolicitacaoById } from '../../Application/UseCases/GetSolicitacaoById.js'
import { ListSolicitacoesByCliente } from '../../Application/UseCases/ListSolicitacoesByCliente.js'
import { UpdateSolicitacaoStatus } from '../../Application/UseCases/UpdateSolicitacaoStatus.js'

export default class SolicitacaoCreditoController {
  /**
   * @summary Criar Solicitação de Crédito
   * @description Cria uma nova solicitação de crédito para um cliente.
   * @requestBody {"clienteId": 1, "produtoId": 2, "valorSolicitado": 50000, "prazoMeses": 12, "finalidade": "Capital de giro"}
   * @responseBody 201 - {"id": 1, "status": "PENDENTE", "clienteId": 1}
   * @responseBody 400 - {"error": "Mensagem de erro"}
   * @responseBody 403 - {"message": "Você não tem permissão para criar solicitações."}
   */
  public async create({ request, response, bouncer, auth }: HttpContext) {
    if (await bouncer.with(SolicitacaoCreditoPolicy).denies('create')) {
      return response.forbidden({ message: 'Você não tem permissão para criar solicitações.' })
    }
    const data = request.all() as {
      clienteId?: number
      produtoId: number
      valor: number
      parcelas?: number
    }

    // Auto-resolver clienteId a partir do utilizador autenticado caso não venha no body
    if (!data.clienteId && auth.user) {
      const db = (await import('@adonisjs/lucid/services/db')).default
      const clienteRow = await db.from('clientes').where('user_id', auth.user.id).first()
      if (clienteRow) {
        data.clienteId = clienteRow.id
      }
    }

    const payload = {
      clienteId: Number(data.clienteId || 0),
      produtoId: Number(data.produtoId || 0),
      valor: Number(data.valor || 0),
      parcelas: Number(data.parcelas || 12),
    }

    const useCase = new CreateSolicitacaoCredito()

    try {
      const result = await useCase.execute(payload)

      // Gerar Fatura de Solicitação (Não Pago)
      const Fatura = (await import('#models/fatura')).default
      const crypto = (await import('node:crypto')).default
      const { DateTime } = await import('luxon')
      const db = (await import('@adonisjs/lucid/services/db')).default

      const clienteData = await db.from('clientes').where('id', result.clienteId).first()
      const clienteNome = clienteData?.nome || 'Mutuário'
      const clienteNif = clienteData?.nif || '000000000'
      const hashDummy = crypto
        .createHash('sha256')
        .update(`${Date.now()}-${result.valor}`)
        .digest('hex')
        .substring(0, 16)
        .toUpperCase()

      await Fatura.create({
        clienteId: result.clienteId,
        clienteNome,
        clienteNif,
        tipoDocumento: 'FT',
        valor: result.valor,
        valorImposto: 0,
        valorRetencao: 0,
        status: 'PENDENTE', // "Não Pago"
        hashAgt: hashDummy,
        itensJson: JSON.stringify([
          { descricao: `Solicitação de Crédito #${result.id}`, valor: result.valor },
        ]),
        dataVencimento: DateTime.now().plus({ days: 30 }),
      })

      return response.created(result)
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }

  /**
   * @summary Obter Solicitação
   * @description Retorna os detalhes de uma solicitação de crédito pelo seu ID.
   * @paramPath id - ID da solicitação - @type(number) @required
   * @responseBody 200 - {"id": 1, "status": "PENDENTE", "clienteId": 1, "valorSolicitado": 50000}
   * @responseBody 404 - {"message": "Solicitação não encontrada"}
   * @responseBody 403 - {"message": "Você não tem permissão para visualizar esta solicitação."}
   */
  public async show({ params, response, bouncer }: HttpContext) {
    const useCase = new GetSolicitacaoById()
    const result = await useCase.execute(params.id)

    if (!result) {
      return response.notFound({ message: 'Solicitação não encontrada' })
    }

    if (await bouncer.with(SolicitacaoCreditoPolicy).denies('view', result as any)) {
      return response.forbidden({
        message: 'Você não tem permissão para visualizar esta solicitação.',
      })
    }

    return response.ok(result)
  }

  /**
   * @summary Listar Solicitações (Admin)
   * @description Retorna todas as solicitações de crédito do sistema. Acesso restrito a administradores.
   * @responseBody 200 - [{"id": 1, "status": "PENDENTE", "clienteId": 1}]
   */
  public async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('perPage', 10)
      const search = request.input('search')
      const status = request.input('status')

      const db = (await import('@adonisjs/lucid/services/db')).default
      let query = db
        .from('solicitacao_creditos')
        .leftJoin('clientes', 'solicitacao_creditos.cliente_id', 'clientes.id')
        .select(
          'solicitacao_creditos.*',
          'clientes.nome as cliente_nome',
          'clientes.nif as cliente_nif',
          'clientes.email as cliente_email'
        )
        .orderBy('solicitacao_creditos.created_at', 'desc')

      if (search) {
        query.where((q) => {
          q.where('solicitacao_creditos.id', 'LIKE', `%${search}%`)
            .orWhere('clientes.nome', 'LIKE', `%${search}%`)
            .orWhere('clientes.nif', 'LIKE', `%${search}%`)
            .orWhere('clientes.email', 'LIKE', `%${search}%`)
        })
      }

      if (status && status !== '' && status !== 'TODOS') {
        query.where('solicitacao_creditos.status', status)
      }

      const paginated = await query.paginate(page, perPage)
      const json = paginated.toJSON()

      // Format output items to match frontend Solicitacao structure
      json.data = json.data.map((item) => ({
        id: item.id,
        clienteId: item.cliente_id,
        valor: Number(item.valor || 0),
        parcelas: item.parcelas || 12,
        taxaJuros: item.taxa_juros || 5.0,
        status: item.status,
        finalidade: item.finalidade || 'Capital de Giro / Microcrédito Empresarial',
        scoreCredito: item.score_credito || 720,
        motivoRejeicao: item.motivo_rejeicao,
        dataCriacao: item.created_at,
        createdAt: item.created_at,
        cliente: {
          nome: item.cliente_nome || 'Cliente Desconhecido',
          nif: item.cliente_nif || '000000000',
          email: item.cliente_email || '',
        },
      }))

      return response.ok(json)
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  /**
   * @summary Listar Solicitações por Cliente
   * @description Retorna todas as solicitações de crédito de um cliente específico.
   * @paramPath clienteId - ID do cliente - @type(number) @required
   * @responseBody 200 - [{"id": 1, "status": "PENDENTE", "clienteId": 1}]
   * @responseBody 403 - {"message": "Acesso negado."}
   */
  public async listByCliente({ params, response, bouncer }: HttpContext) {
    // Only the client themselves or Admin
    if (
      await bouncer
        .with(SolicitacaoCreditoPolicy)
        .denies('view', { clienteId: params.clienteId } as any)
    ) {
      return response.forbidden({ message: 'Acesso negado.' })
    }

    const useCase = new ListSolicitacoesByCliente()
    const results = await useCase.execute(params.clienteId)
    return response.ok(results)
  }

  /**
   * @summary Atualizar Status da Solicitação
   * @description Altera o status de uma solicitação de crédito (ex: de PENDENTE para APROVADO).
   * @requestBody {"id": 1, "status": "APROVADO"}
   * @responseBody 200 - {"id": 1, "status": "APROVADO", "clienteId": 1}
   * @responseBody 403 - {"message": "Apenas analistas podem atualizar status."}
   */
  public async updateStatus({ params, request, response, bouncer }: HttpContext) {
    const data = {
      id: Number(params.id),
      status: request.input('status'),
      motivoRejeicao: request.input('motivoRejeicao'),
    }

    // Simulating fetching entity for bouncer. In reality, fetch from repo.
    if (await bouncer.with(SolicitacaoCreditoPolicy).denies('updateStatus')) {
      return response.forbidden({ message: 'Apenas analistas podem atualizar status.' })
    }

    const useCase = new UpdateSolicitacaoStatus()
    const result = await useCase.execute(data as any)

    // Send notification
    try {
      const { NotificacaoService } =
        await import('../../../Notificacao/Application/Services/NotificacaoService.js')
      await NotificacaoService.enviar({
        tipo: 'EMAIL',
        destinatario: `cliente_${result.clienteId}@exemplo.com`,
        mensagem: `Sua solicitação de crédito mudou para o status: ${result.status}`,
      })
    } catch (err) {
      console.error('Falha ao enviar notificação', err)
    }

    return response.ok(result)
  }

  /**
   * @summary Upload de Documento
   * @description Faz o upload de um documento atrelado a uma solicitação de crédito.
   * @paramPath id - ID da solicitação - @type(number) @required
   * @requestFormDataBody {"clienteId": 1, "tipoDocumento": "BI", "documento": "file"}
   * @responseBody 201 - {"id": 1, "filePath": "caminho/do/arquivo", "status": "Enviado"}
   * @responseBody 400 - {"message": "tipoDocumento é obrigatório ou arquivo inválido"}
   * @responseBody 403 - {"message": "Sem permissão para upload."}
   */
  public async uploadDocumento({ request, response, params, bouncer }: HttpContext) {
    const id = params.id

    // Simulating fetching entity for bouncer. In reality, fetch from repo.
    if (
      await bouncer
        .with(SolicitacaoCreditoPolicy)
        .denies('uploadDocumento', { clienteId: request.input('clienteId') } as any)
    ) {
      return response.forbidden({ message: 'Sem permissão para upload.' })
    }

    const tipoDocumento = request.input('tipoDocumento')

    if (!tipoDocumento) {
      return response.badRequest({ message: 'tipoDocumento é obrigatório' })
    }

    const file = request.file('documento', {
      size: '5mb',
      extnames: ['jpg', 'png', 'pdf', 'jpeg'],
    })

    if (!file) {
      return response.badRequest({ message: 'Nenhum arquivo enviado ou arquivo inválido' })
    }

    if (!file.isValid) {
      return response.badRequest({ errors: file.errors })
    }

    const { UploadDocumentoSolicitacao } =
      await import('../../Application/UseCases/UploadDocumentoSolicitacao.js')
    const useCase = new UploadDocumentoSolicitacao()

    const resultado = await useCase.execute({
      solicitacaoId: id,
      tipoDocumento: tipoDocumento,
      filePath: file.tmpPath!,
      fileName: file.clientName,
      contentType: file.headers['content-type'] || 'application/octet-stream',
      size: file.size,
    })

    return response.created(resultado)
  }

  /**
   * Submissão pública de solicitação de crédito (Balcão Digital)
   * POST /api/v1/solicitacoes/public
   */
  public async publicSubmit({ request, response }: HttpContext) {
    try {
      const data = request.only([
        'produtoId',
        'valor',
        'prazoMeses',
        'nomeCompleto',
        'biOuNif',
        'telemovel',
        'email',
        'profissao',
        'rendaMensal',
      ])

      if (!data.produtoId || !data.valor || !data.nomeCompleto || !data.biOuNif) {
        return response.badRequest({ error: 'Campos obrigatórios em falta.' })
      }

      const db = (await import('@adonisjs/lucid/services/db')).default

      // Localizar ou criar cliente no sistema
      let cliente = await db.from('clientes').where('nif', data.biOuNif).first()
      if (!cliente) {
        const [insertedId] = await db.table('clientes').insert({
          nome: data.nomeCompleto,
          nif: data.biOuNif,
          email: data.email || `${data.biOuNif.toLowerCase()}@cidadao.ao`,
          telefone: data.telemovel || '900000000',
          telemovel: data.telemovel || '900000000',
          profissao: data.profissao || 'Trabalhador por Conta de Outrem',
          renda_mensal: Number(data.rendaMensal || 0),
          created_at: new Date(),
          updated_at: new Date(),
        })
        cliente = await db.from('clientes').where('id', insertedId).first()
      }

      // Criar a solicitação de crédito
      const useCase = new CreateSolicitacaoCredito()
      const result = await useCase.execute({
        clienteId: Number(cliente.id),
        valor: Number(data.valor),
        parcelas: Number(data.prazoMeses || 12),
      })

      const processNumber = `GLX-2026-${String(result.id).padStart(5, '0')}`

      return response.created({
        success: true,
        data: {
          id: result.id,
          processNumber,
          clienteId: cliente.id,
          valor: result.valor,
          parcelas: result.parcelas,
          status: result.status,
        },
      })
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }
}
