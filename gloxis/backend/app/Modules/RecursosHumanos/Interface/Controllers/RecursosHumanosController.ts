import type { HttpContext } from '@adonisjs/core/http'
import { GestaoRecursosHumanosUseCase } from '../../Application/UseCases/GestaoRecursosHumanosUseCase.js'
import { RecursosHumanosMySQLRepository } from '../../Infrastructure/Repositories/RecursosHumanosMySQLRepository.js'
import Funcionario from '#models/funcionario'

export default class RecursosHumanosController {
  private useCase: GestaoRecursosHumanosUseCase

  constructor() {
    const mysqlRepo = new RecursosHumanosMySQLRepository()
    this.useCase = new GestaoRecursosHumanosUseCase(mysqlRepo)
  }

  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const perPage = request.input('perPage', 50)

    const result = await this.useCase.listar(page, perPage)
    return {
      meta: result.meta,
      data: result.data.map((e) => e.toJSON()),
    }
  }

  async kpis() {
    const todos = await Funcionario.all()
    const totalFuncionarios = todos.length
    const funcionariosAtivos = todos.filter(
      (f) => f.status === 'ATIVO' || f.status === undefined
    ).length
    const massaSalarialTotal = todos.reduce(
      (acc, f) =>
        acc +
        Number(f.salario || 0) +
        Number(f.subsidioAlimentacao || 0) +
        Number(f.subsidioTransporte || 0),
      0
    )
    const mediaSalarial =
      totalFuncionarios > 0 ? Math.round(massaSalarialTotal / totalFuncionarios) : 0

    return {
      totalFuncionarios,
      funcionariosAtivos,
      massaSalarialTotal,
      mediaSalarial,
    }
  }

  async store({ request }: HttpContext) {
    const data = request.all()

    const payload = {
      nome: data.nome || 'Novo Funcionário Gloxis',
      cargo: data.cargo || 'Especialista de Sistemas',
      departamento: data.departamento || 'TI & ENGENHARIA',
      nif: data.nif || '5418992010',
      iban: data.iban || 'AO06.0006.0000.1234.5678.1018.9',
      salario: data.salario || 350000,
      subsidio_alimentacao: data.subsidio_alimentacao || data.subsidioAlimentacao || 30000,
      subsidio_transporte: data.subsidio_transporte || data.subsidioTransporte || 25000,
      status: data.status || 'ATIVO',
    }

    const entity = await this.useCase.criar(payload)
    return entity.toJSON()
  }

  async show({ params }: HttpContext) {
    const entity = await this.useCase.obterPorId(params.id)
    return entity.toJSON()
  }

  async update({ params, request }: HttpContext) {
    const data = request.all()
    const entity = await this.useCase.atualizar(params.id, data)
    return entity.toJSON()
  }

  async destroy({ params }: HttpContext) {
    return await this.useCase.remover(params.id)
  }
}
