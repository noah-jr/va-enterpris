import type { HttpContext } from '@adonisjs/core/http'
import { AdicionarGarantia } from '../../Application/UseCases/AdicionarGarantia.js'
import { AvaliarGarantia } from '../../Application/UseCases/AvaliarGarantia.js'
import { GarantiaRepositoryImpl } from '../../Infrastructure/Repositories/GarantiaRepositoryImpl.js'

export default class GarantiaController {
  public async adicionar({ request, response }: HttpContext) {
    const data = request.only(['solicitacaoId', 'tipo', 'valorEstimado', 'descricao', 'detalhes'])
    const useCase = new AdicionarGarantia(new GarantiaRepositoryImpl())

    try {
      const result = await useCase.execute(data as any)
      return response.created({ message: 'Garantia adicionada com sucesso.', data: result })
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }

  public async avaliar({ params, request, auth, response }: HttpContext) {
    const garantiaId = params.id
    const user = await auth.user!
    const { statusAvaliacao, valorAvaliado } = request.only(['statusAvaliacao', 'valorAvaliado'])
    const useCase = new AvaliarGarantia(new GarantiaRepositoryImpl())

    try {
      await useCase.execute({
        garantiaId,
        statusAvaliacao,
        valorAvaliado,
        avaliadoPorUserId: user.id,
      })
      return response.ok({ message: 'Garantia avaliada com sucesso.' })
    } catch (error) {
      return response.badRequest({ error: (error as Error).message })
    }
  }

  public async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('perPage', 10)
      const search = request.input('search')
      const status = request.input('status')

      const db = (await import('@adonisjs/lucid/services/db')).default
      let query = db
        .from('garantias')
        .leftJoin('solicitacao_creditos', 'garantias.solicitacao_id', 'solicitacao_creditos.id')
        .leftJoin('clientes', 'solicitacao_creditos.cliente_id', 'clientes.id')
        .select('garantias.*', 'clientes.nome as cliente_nome')
        .orderBy('garantias.created_at', 'desc')

      if (search) {
        query.where((q) => {
          q.where('garantias.id', 'LIKE', `%${search}%`)
            .orWhere('garantias.solicitacao_id', 'LIKE', `%${search}%`)
            .orWhere('garantias.descricao', 'LIKE', `%${search}%`)
            .orWhere('clientes.nome', 'LIKE', `%${search}%`)
        })
      }

      if (status && status !== '' && status !== 'TODOS') {
        query.where('garantias.status_avaliacao', status)
      }

      const paginated = await query.paginate(page, perPage)
      const json = paginated.toJSON()

      json.data = json.data.map((item) => ({
        id: item.id,
        solicitacaoId: item.solicitacao_id,
        tipo: item.tipo,
        valorEstimado: Number(item.valor_estimado || 0),
        valorAvaliado: item.valor_avaliado ? Number(item.valor_avaliado) : null,
        descricao: item.descricao || 'Sem descrição fornecida',
        statusAvaliacao: item.status_avaliacao,
        clienteNome: item.cliente_nome || 'Mutuário Gloxis',
        createdAt: item.created_at,
      }))

      return response.ok(json)
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  public async listarPorSolicitacao({ params, response }: HttpContext) {
    const { solicitacaoId } = params
    try {
      const { default: GarantiaModel } = await import('#models/Garantia')
      const garantias = await GarantiaModel.query().where('solicitacao_id', solicitacaoId)
      return response.ok({ data: garantias })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }
}
