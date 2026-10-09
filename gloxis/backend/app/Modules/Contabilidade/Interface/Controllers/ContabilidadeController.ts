import type { HttpContext } from '@adonisjs/core/http'
import { GestaoContabilidadeUseCase } from '../../Application/UseCases/GestaoContabilidadeUseCase.js'
import { ContabilidadeMySQLRepository } from '../../Infrastructure/Repositories/ContabilidadeMySQLRepository.js'
import LancamentoContabil from '#models/lancamento_contabil'

export default class ContabilidadeController {
  private useCase: GestaoContabilidadeUseCase

  constructor() {
    const mysqlRepo = new ContabilidadeMySQLRepository()
    this.useCase = new GestaoContabilidadeUseCase(mysqlRepo)
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
    const todos = await LancamentoContabil.all()
    const totalLancamentos = todos.length
    const totalDebito = todos
      .filter((l) => l.tipo === 'DEBITO')
      .reduce((acc, l) => acc + Number(l.valor), 0)
    const totalCredito = todos
      .filter((l) => l.tipo === 'CREDITO')
      .reduce((acc, l) => acc + Number(l.valor), 0)
    const balanceteVerificacao = totalDebito - totalCredito

    return {
      totalLancamentos,
      totalDebito,
      totalCredito,
      balanceteVerificacao,
    }
  }

  async store({ request }: HttpContext) {
    const data = request.all()

    // Normalizar payload
    const payload = {
      codigo_conta: data.codigo_conta || data.codigoConta || '11.1',
      conta: data.conta || 'Depósitos à Ordem - BFA',
      descricao: data.descricao || 'Lançamento Contabilístico Diário',
      diario: data.diario || 'Diário Geral',
      valor: data.valor || 0,
      tipo: data.tipo || 'DEBITO',
      exercicio_fiscal: data.exercicio_fiscal || data.exercicioFiscal || '2026',
      criado_por: data.criado_por || data.criadoPor || 'Contabilista Certificado Gloxis',
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
