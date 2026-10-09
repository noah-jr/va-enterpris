import type { HttpContext } from '@adonisjs/core/http'
import { GerarRelatorioKPIs } from '../../Application/UseCases/GerarRelatorioKPIs.js'

export default class RelatorioController {
  /**
   * GET /api/v1/relatorios/kpis
   * Retorna snapshot completo de KPIs da plataforma
   */
  async kpis({ response }: HttpContext) {
    const useCase = new GerarRelatorioKPIs()
    const data = await useCase.execute()
    return response.ok({ data })
  }
}
