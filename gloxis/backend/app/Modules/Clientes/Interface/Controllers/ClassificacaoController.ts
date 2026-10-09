import type { HttpContext } from '@adonisjs/core/http'
import { ObterClassificacao } from '../../Application/UseCases/ObterClassificacao.js'
import { ListarClassificacoes } from '../../Application/UseCases/ListarClassificacoes.js'
import { ClassificacaoRepositoryImpl } from '../../Infrastructure/Repositories/ClassificacaoRepositoryImpl.js'

export default class ClassificacaoController {
  private repository = new ClassificacaoRepositoryImpl()

  private useCases = {
    obter: new ObterClassificacao(this.repository),
    listar: new ListarClassificacoes(this.repository),
  }

  /**
   * GET /api/v1/classificacao/:clienteId
   * Retorna a classificação de fidelidade de um cliente
   */
  async show({ params, response }: HttpContext) {
    try {
      const data = await this.useCases.obter.execute(params.clienteId)
      return response.ok({ data })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  /**
   * GET /api/v1/classificacao
   * Lista todos os clientes com suas classificações (Admin)
   */
  async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('perPage', 20)
      const nivel = request.input('nivel')

      const data = await this.useCases.listar.execute(nivel, page, perPage)
      return response.ok({ data })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }
}
