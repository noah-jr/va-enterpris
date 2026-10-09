import type { HttpContext } from '@adonisjs/core/http'
import { GestaoVendaUseCase } from '../../Application/UseCases/GestaoVendaUseCase.js'
import { VendaMySQLRepository } from '../../Infrastructure/Repositories/VendaMySQLRepository.js'
import Venda from '#models/venda'

export default class VendaController {
  private useCase: GestaoVendaUseCase

  constructor() {
    const mysqlRepo = new VendaMySQLRepository()
    this.useCase = new GestaoVendaUseCase(mysqlRepo)
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
    const todas = await Venda.all()
    const totalVendas = todas.length
    const receitaTotal = todas
      .filter((v) => v.status === 'PAGO')
      .reduce((acc, v) => acc + Number(v.valor), 0)
    const vendasPendentes = todas.filter((v) => v.status === 'PENDENTE').length
    const vendasPagas = todas.filter((v) => v.status === 'PAGO').length
    const ticketMedio = totalVendas > 0 ? receitaTotal / (vendasPagas || 1) : 0

    return {
      totalVendas,
      receitaTotal,
      vendasPendentes,
      vendasPagas,
      ticketMedio,
    }
  }

  async store({ request }: HttpContext) {
    const data = request.all()

    // Normalizar payload
    const payload = {
      cliente_id: data.cliente_id || data.clienteId || null,
      cliente_nome: data.cliente_nome || data.clienteNome || 'Cliente Consumidor Final',
      cliente_email: data.cliente_email || data.clienteEmail || null,
      valor: data.valor || 0,
      status: data.status || 'PENDENTE',
      forma_pagamento: data.forma_pagamento || data.formaPagamento || 'MULTICAIXA',
      itens_json:
        typeof data.itens === 'object' ? JSON.stringify(data.itens) : data.itens_json || '[]',
      desconto: data.desconto || 0,
      imposto_iva: data.imposto_iva || 14,
      notas: data.notas || null,
      vendedor: data.vendedor || 'Operador Caixa / Vendedor',
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
