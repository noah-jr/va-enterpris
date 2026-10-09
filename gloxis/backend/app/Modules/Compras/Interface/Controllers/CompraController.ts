import type { HttpContext } from '@adonisjs/core/http'
import { GestaoCompraUseCase } from '../../Application/UseCases/GestaoCompraUseCase.js'
import { CompraMySQLRepository } from '../../Infrastructure/Repositories/CompraMySQLRepository.js'
import Compra from '#models/compra'

export default class CompraController {
  private useCase: GestaoCompraUseCase

  constructor() {
    const mysqlRepo = new CompraMySQLRepository()
    this.useCase = new GestaoCompraUseCase(mysqlRepo)
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
    const todas = await Compra.all()
    const totalCompras = todas.length
    const despesaTotal = todas
      .filter((c) => c.status === 'PAGO')
      .reduce((acc, c) => acc + Number(c.valor), 0)
    const comprasPendentes = todas.filter((c) => c.status === 'PENDENTE').length
    const comprasPagas = todas.filter((c) => c.status === 'PAGO').length

    return {
      totalCompras,
      despesaTotal,
      comprasPendentes,
      comprasPagas,
    }
  }

  async store({ request }: HttpContext) {
    const data = request.all()

    // Normalizar payload
    const payload = {
      fornecedor_id: data.fornecedor_id || data.fornecedorId || null,
      fornecedor_nome: data.fornecedor_nome || data.fornecedorNome || 'Fornecedor Geral',
      fornecedor_nif: data.fornecedor_nif || data.fornecedorNif || '5418000000',
      categoria: data.categoria || 'GERAL',
      forma_pagamento: data.forma_pagamento || data.formaPagamento || 'TRANSFERENCIA',
      valor: data.valor || 0,
      status: data.status || 'PENDENTE',
      itens_json:
        typeof data.itens === 'object' ? JSON.stringify(data.itens) : data.itens_json || '[]',
      notas: data.notas || null,
      comprador: data.comprador || 'Gestor de Compras Gloxis ERP',
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
