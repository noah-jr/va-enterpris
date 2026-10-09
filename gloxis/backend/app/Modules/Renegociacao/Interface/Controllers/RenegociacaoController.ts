import type { HttpContext } from '@adonisjs/core/http'
import { SolicitarRenegociacao } from '../../Application/UseCases/SolicitarRenegociacao.js'
import { AprovarRenegociacao } from '../../Application/UseCases/AprovarRenegociacao.js'
import { RenegociacaoRepositoryImpl } from '../../Infrastructure/Repositories/RenegociacaoRepositoryImpl.js'

export default class RenegociacaoController {
  public async solicitar({ request, response }: HttpContext) {
    const data = request.only([
      'solicitacaoId',
      'clienteId',
      'jurosMoraPerdoados',
      'multasPerdoadas',
      'novasParcelas',
      'novaTaxaJuros',
    ])
    const useCase = new SolicitarRenegociacao(new RenegociacaoRepositoryImpl())

    try {
      const result = await useCase.execute(data as any)
      return response.created({ message: 'Renegociação solicitada com sucesso.', data: result })
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }

  public async aprovar({ params, auth, response }: HttpContext) {
    const renegociacaoId = params.id
    const user = await auth.user!
    const useCase = new AprovarRenegociacao()

    try {
      await useCase.execute(renegociacaoId, user.id)
      return response.ok({ message: 'Renegociação aprovada e novo plano gerado com sucesso.' })
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }

  public async listar({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('perPage', 10)
      const search = request.input('search')
      const status = request.input('status')

      const db = (await import('@adonisjs/lucid/services/db')).default
      let query = db
        .from('renegociacoes')
        .leftJoin('solicitacao_creditos', 'renegociacoes.solicitacao_id', 'solicitacao_creditos.id')
        .leftJoin('clientes', 'renegociacoes.cliente_id', 'clientes.id')
        .select('renegociacoes.*', 'clientes.nome as cliente_nome', 'clientes.nif as cliente_nif')
        .orderBy('renegociacoes.created_at', 'desc')

      if (search) {
        query.where((q) => {
          q.where('renegociacoes.id', 'LIKE', `%${search}%`)
            .orWhere('renegociacoes.solicitacao_id', 'LIKE', `%${search}%`)
            .orWhere('clientes.nome', 'LIKE', `%${search}%`)
            .orWhere('clientes.nif', 'LIKE', `%${search}%`)
        })
      }

      if (status && status !== '' && status !== 'TODOS') {
        query.where('renegociacoes.status', status)
      }

      const paginated = await query.paginate(page, perPage)
      const json = paginated.toJSON()

      json.data = json.data.map((item) => ({
        id: item.id,
        solicitacaoId: item.solicitacao_id,
        clienteId: item.cliente_id,
        jurosMoraPerdoados: Number(item.juros_mora_perdoados || 0),
        multasPerdoadas: Number(item.multas_perdoadas || 0),
        novasParcelas: item.novas_parcelas || 12,
        novaTaxaJuros: Number(item.nova_taxa_juros || 5.0),
        status: item.status,
        aprovadoPorUserId: item.aprovado_por_user_id,
        createdAt: item.created_at,
        clienteNome: item.cliente_nome || 'Mutuário Inadimplente',
      }))

      return response.ok(json)
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }
}
