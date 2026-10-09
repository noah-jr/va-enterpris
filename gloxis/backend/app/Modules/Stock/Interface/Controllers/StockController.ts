import type { HttpContext } from '@adonisjs/core/http'
import { GestaoStockUseCase } from '../../Application/UseCases/GestaoStockUseCase.js'
import { StockMySQLRepository } from '../../Infrastructure/Repositories/StockMySQLRepository.js'
import StockItem from '#models/stock_item'

export default class StockController {
  private useCase: GestaoStockUseCase

  constructor() {
    const mysqlRepo = new StockMySQLRepository()
    this.useCase = new GestaoStockUseCase(mysqlRepo)
  }

  async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const perPage = request.input('perPage', 10)
      const search = request.input('search')
      const categoria = request.input('categoria')

      const db = (await import('@adonisjs/lucid/services/db')).default
      let query = db.from('stock_items').orderBy('created_at', 'desc')

      if (search) {
        query.where((q) => {
          q.where('nome', 'LIKE', `%${search}%`)
            .orWhere('codigo_sku', 'LIKE', `%${search}%`)
            .orWhere('localizacao', 'LIKE', `%${search}%`)
        })
      }

      if (categoria && categoria !== '' && categoria !== 'TODOS') {
        query.where('categoria', categoria)
      }

      const paginated = await query.paginate(page, perPage)
      const json = paginated.toJSON()

      json.data = json.data.map((item) => ({
        id: item.id,
        produtoId: item.produto_id,
        nome: item.nome,
        codigoSku: item.codigo_sku,
        categoria: item.categoria,
        quantidade: item.quantidade,
        precoUnitario: Number(item.preco_unitario || 0),
        localizacao: item.localizacao,
        minimoAlerta: item.minimo_alerta,
        status:
          item.quantidade <= (item.minimo_alerta || 10)
            ? item.quantidade === 0
              ? 'SEM_ESTOQUE'
              : 'CRITICO'
            : 'DISPONIVEL',
      }))

      return response.ok(json)
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  async kpis() {
    const todos = await StockItem.all()
    const totalItens = todos.length
    const valorTotalEstoque = todos.reduce(
      (acc, i) => acc + Number(i.quantidade) * Number(i.precoUnitario || 0),
      0
    )
    const itensCriticos = todos.filter((i) => i.quantidade <= (i.minimoAlerta || 10)).length
    const totalUnidades = todos.reduce((acc, i) => acc + Number(i.quantidade), 0)

    return {
      totalItens,
      valorTotalEstoque,
      itensCriticos,
      totalUnidades,
    }
  }

  async store({ request }: HttpContext) {
    const data = request.all()

    const { randomUUID } = await import('node:crypto')
    const shortId = randomUUID().split('-')[0].toUpperCase()

    // Normalizar payload
    const payload = {
      produto_id: data.produto_id || data.produtoId || Math.floor(Date.now() / 1000),
      nome: data.nome || 'Produto / Item de Inventário',
      codigo_sku: data.codigo_sku || data.codigoSku || `SKU-${shortId}`,
      categoria: data.categoria || 'GERAL',
      quantidade: data.quantidade || 0,
      preco_unitario: data.preco_unitario || data.precoUnitario || 0,
      localizacao: data.localizacao || 'Armazém Central - Luanda',
      minimo_alerta: data.minimo_alerta || data.minimoAlerta || 10,
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
