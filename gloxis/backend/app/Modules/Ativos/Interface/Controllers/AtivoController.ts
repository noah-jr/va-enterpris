import type { HttpContext } from '@adonisjs/core/http'
import { GestaoAtivoUseCase } from '../../Application/UseCases/GestaoAtivoUseCase.js'
import { AtivoMySQLRepository } from '../../Infrastructure/Repositories/AtivoMySQLRepository.js'
import Ativo from '#models/ativo'

export default class AtivoController {
  private useCase: GestaoAtivoUseCase

  constructor() {
    const mysqlRepo = new AtivoMySQLRepository()
    this.useCase = new GestaoAtivoUseCase(mysqlRepo)
  }

  async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('perPage', 10)
      const search = request.input('search')
      const categoria = request.input('categoria')

      const db = (await import('@adonisjs/lucid/services/db')).default
      let query = db.from('ativos').orderBy('created_at', 'desc')

      if (search) {
        query.where((q) => {
          q.where('id', 'LIKE', `%${search}%`)
            .orWhere('nome', 'LIKE', `%${search}%`)
            .orWhere('localizacao', 'LIKE', `%${search}%`)
            .orWhere('responsavel', 'LIKE', `%${search}%`)
        })
      }

      if (categoria && categoria !== '' && categoria !== 'TODOS') {
        query.where('categoria', categoria)
      }

      const paginated = await query.paginate(page, perPage)
      const json = paginated.toJSON()

      json.data = json.data.map((item) => ({
        id: item.id,
        pat: `PAT-${String(item.id).padStart(5, '0')}`,
        nome: item.nome,
        categoria: item.categoria,
        localizacao: item.localizacao,
        responsavel: item.responsavel,
        valor: Number(item.valor || 0),
        estadoConservacao: item.estado_conservacao || 'EXCELENTE',
        taxaDepreciacaoAnual: Number(item.taxa_depreciacao_anual || 20.0),
        createdAt: item.created_at,
      }))

      return response.ok(json)
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  async kpis() {
    const todos = await Ativo.all()
    const totalAtivos = todos.length
    const valorPatrimonialTotal = todos.reduce((acc, a) => acc + Number(a.valor || 0), 0)
    const ativosOperacionais = todos.filter(
      (a) => a.estadoConservacao !== 'DANIFICADO' && a.estadoConservacao !== 'ABATIDO'
    ).length
    const depreciacaoAnualEstimada = Math.round(
      todos.reduce(
        (acc, a) => acc + Number(a.valor || 0) * (Number(a.taxaDepreciacaoAnual || 20) / 100),
        0
      )
    )

    return {
      totalAtivos,
      valorPatrimonialTotal,
      ativosOperacionais,
      depreciacaoAnualEstimada,
    }
  }

  async store({ request }: HttpContext) {
    const data = request.all()

    const payload = {
      nome: data.nome || 'Novo Equipamento Patrimonial',
      categoria: data.categoria || 'Equipamento Informático',
      localizacao: data.localizacao || 'Sede Luanda',
      responsavel: data.responsavel || 'Direção de Operações',
      valor: data.valor || 1500000,
      estado_conservacao: data.estado_conservacao || data.estadoConservacao || 'EXCELENTE',
      taxa_depreciacao_anual: data.taxa_depreciacao_anual || data.taxaDepreciacaoAnual || 20.0,
    }

    const entity = await this.useCase.criar(payload)
    return entity.toJSON ? entity.toJSON() : entity
  }

  async show({ params }: HttpContext) {
    const entity = await this.useCase.obterPorId(params.id)
    return entity.toJSON ? entity.toJSON() : entity
  }

  async update({ params, request }: HttpContext) {
    const data = request.all()
    const entity = await this.useCase.atualizar(params.id, data)
    return entity.toJSON ? entity.toJSON() : entity
  }

  async destroy({ params }: HttpContext) {
    return await this.useCase.remover(params.id)
  }
}
