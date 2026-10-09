import type { HttpContext } from '@adonisjs/core/http'
import { GestaoProjetoUseCase } from '../../Application/UseCases/GestaoProjetoUseCase.js'
import { ProjetoMySQLRepository } from '../../Infrastructure/Repositories/ProjetoMySQLRepository.js'
import Projeto from '#models/projeto'

export default class ProjetoController {
  private useCase: GestaoProjetoUseCase

  constructor() {
    const mysqlRepo = new ProjetoMySQLRepository()
    this.useCase = new GestaoProjetoUseCase(mysqlRepo)
  }

  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 50)

    const result = await this.useCase.listar(page, perPage)
    return {
      meta: result.meta,
      data: result.data.map((e: any) => (e.toJSON ? e.toJSON() : e)),
    }
  }

  async kpis() {
    const todos = await Projeto.all()
    const totalProjetos = todos.length
    const projetosEmAndamento = todos.filter(
      (p) => p.status === 'EM_ANDAMENTO' || p.status === undefined
    ).length
    const orcamentoTotalGeral = todos.reduce((acc, p) => acc + Number(p.orcamento || 0), 0)
    const projetosConcluidos = todos.filter((p) => p.status === 'CONCLUIDO').length

    return {
      totalProjetos,
      projetosEmAndamento,
      orcamentoTotalGeral,
      projetosConcluidos,
    }
  }

  async store({ request }: HttpContext) {
    const data = request.all()

    const payload = {
      nome: data.nome || 'Novo Projeto Corporativo',
      gerente_projeto: data.gerente_projeto || data.gerenteProjeto || 'Gestor de Projetos Gloxis',
      cliente_nome: data.cliente_nome || data.clienteNome || 'Cliente Interno',
      orcamento: data.orcamento || 2500000,
      progresso_percentual: data.progresso_percentual || data.progressoPercentual || 15,
      status: data.status || 'EM_ANDAMENTO',
      data_inicio: data.data_inicio || new Date().toISOString().split('T')[0],
      data_prevista_fim:
        data.data_prevista_fim ||
        new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
