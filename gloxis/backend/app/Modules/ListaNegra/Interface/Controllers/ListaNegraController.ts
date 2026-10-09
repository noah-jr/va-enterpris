import type { HttpContext } from '@adonisjs/core/http'
import { AdicionarListaNegra } from '../../Application/UseCases/AdicionarListaNegra.js'
import { RemoverListaNegra } from '../../Application/UseCases/RemoverListaNegra.js'
import { ConsultarListaNegra } from '../../Application/UseCases/ConsultarListaNegra.js'

export default class ListaNegraController {
  /**
   * GET /api/v1/lista-negra
   * Lista todos os registros ativos da lista negra
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 20)

    const useCase = new ConsultarListaNegra()
    const data = await useCase.listar(page, perPage)

    return response.ok({ data })
  }

  /**
   * GET /api/v1/lista-negra/:clienteId/historico
   * Histórico completo de um cliente na lista negra
   */
  async historico({ params, response }: HttpContext) {
    const useCase = new ConsultarListaNegra()
    const data = await useCase.historico(params.clienteId)
    return response.ok({ data })
  }

  /**
   * GET /api/v1/lista-negra/:clienteId/status
   * Verifica se cliente está atualmente na lista negra
   */
  async status({ params, response }: HttpContext) {
    const useCase = new ConsultarListaNegra()
    const ativo = await useCase.isClienteNaLista(params.clienteId)
    return response.ok({ clienteId: params.clienteId, naListaNegra: ativo })
  }

  /**
   * POST /api/v1/lista-negra
   * Adiciona um cliente manualmente à lista negra
   */
  async store({ request, response }: HttpContext) {
    const { clienteId, motivo } = request.only(['clienteId', 'motivo'])

    if (!clienteId || !motivo) {
      return response.badRequest({ error: 'clienteId e motivo são obrigatórios' })
    }

    const useCase = new AdicionarListaNegra()
    const registro = await useCase.execute({ clienteId, motivo })

    return response.created({ data: registro })
  }

  /**
   * DELETE /api/v1/lista-negra/:id
   * Remove um cliente da lista negra (requer justificação)
   */
  async destroy({ params, request, response }: HttpContext) {
    const { justificativa, removidoPor } = request.only(['justificativa', 'removidoPor'])

    if (!justificativa) {
      return response.badRequest({
        error: 'justificativa é obrigatória para remover da lista negra',
      })
    }

    const useCase = new RemoverListaNegra()
    const registro = await useCase.execute({
      listaNegrId: params.id,
      removidoPor: removidoPor,
      justificativa,
    })

    return response.ok({ data: registro, message: 'Cliente removido da lista negra com sucesso' })
  }
}
