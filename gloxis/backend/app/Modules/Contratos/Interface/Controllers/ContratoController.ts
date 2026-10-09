import type { HttpContext } from '@adonisjs/core/http'
import { GestaoContratoUseCase } from '../../Application/UseCases/GestaoContratoUseCase.js'
import { ContratoMySQLRepository } from '../../Infrastructure/Repositories/ContratoMySQLRepository.js'
import Contrato from '#models/contrato'

export default class ContratoController {
  private useCase: GestaoContratoUseCase

  constructor() {
    const mysqlRepo = new ContratoMySQLRepository()
    this.useCase = new GestaoContratoUseCase(mysqlRepo)
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
    const todos = await Contrato.all()
    const totalContratos = todos.length
    const contratosAtivos = todos.filter(
      (c) => c.status === 'ATIVO' || c.status === undefined
    ).length
    const valorCarteiraContratos = todos
      .filter((c) => c.status === 'ATIVO')
      .reduce((acc, c) => acc + Number(c.valorContrato || 0), 0)
    const contratosExpirados = todos.filter((c) => c.status === 'EXPIRADO').length

    return {
      totalContratos,
      contratosAtivos,
      valorCarteiraContratos,
      contratosExpirados,
    }
  }

  async store({ request }: HttpContext) {
    const data = request.all()

    const payload = {
      titulo: data.titulo || 'Contrato de Prestação de Serviços',
      tipo: data.tipo || 'PRESTACAO_SERVICOS',
      parte_contratante: data.parte_contratante || data.parteContratante || 'Empresa Parceira S.A.',
      valor_contrato: data.valor_contrato || data.valorContrato || 500000,
      status: data.status || 'ATIVO',
      data_inicio: data.data_inicio || new Date().toISOString().split('T')[0],
      data_fim:
        data.data_fim ||
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
