import type { HttpContext } from '@adonisjs/core/http'
import Pagamento from '#models/Pagamento'
import { PaginationHelper } from '../../../Core/Application/DTOs/PaginationDTO.js'

export default class FinanceiroController {
  async index({ request }: HttpContext) {
    const { page, perPage } = PaginationHelper.normalizeParams(
      request.input('page'),
      request.input('perPage'),
      20
    )
    const search = request.input('search')
    const tipo = request.input('tipo')
    const categoria = request.input('categoria')
    const status = request.input('status')

    const query = Pagamento.query().orderBy('id', 'desc')

    if (search) {
      query.where((q) => {
        q.where('descricao', 'like', `%${search}%`)
          .orWhere('entidadeNome', 'like', `%${search}%`)
          .orWhere('contaBancaria', 'like', `%${search}%`)
      })
    }

    if (tipo && tipo !== 'TODOS') {
      query.where('tipo', tipo)
    }

    if (categoria && categoria !== 'TODOS') {
      query.where('categoria', categoria)
    }

    if (status && status !== 'TODOS') {
      query.where('status', status)
    }

    const paginated = await query.paginate(page, perPage)
    return paginated.toJSON()
  }

  async kpis() {
    const todos = await Pagamento.all()
    const receitaTotal = todos
      .filter((p) => p.tipo === 'RECEITA' || p.tipo === undefined)
      .reduce((acc, p) => acc + Number(p.valorPago || 0), 0)
    const despesaTotal = todos
      .filter((p) => p.tipo === 'DESPESA')
      .reduce((acc, p) => acc + Number(p.valorPago || 0), 0)
    const saldoTesouraria = receitaTotal - despesaTotal
    const totalTransacoes = todos.length

    return {
      receitaTotal,
      despesaTotal,
      saldoTesouraria,
      totalTransacoes,
    }
  }

  async store({ request }: HttpContext) {
    const data = request.all()

    const pagamento = await Pagamento.create({
      solicitacaoId: data.solicitacao_id || data.solicitacaoId || null,
      descricao: data.descricao || 'Lançamento de Tesouraria',
      tipo: data.tipo || 'RECEITA',
      categoria: data.categoria || 'OPERACIONAL',
      entidadeNome: data.entidade_nome || data.entidadeNome || 'Entidade Financeira Geral',
      contaBancaria: data.conta_bancaria || data.contaBancaria || 'BFA - Conta Corrente Principal',
      valorPago: Number(data.valor_pago || data.valorPago || data.valor || 0),
      metodo: data.metodo || 'TRANSFERENCIA',
      status: data.status || 'CONCLUIDO',
    })

    return pagamento
  }

  async show({ params }: HttpContext) {
    return await Pagamento.findOrFail(params.id)
  }

  async update({ params, request }: HttpContext) {
    const pagamento = await Pagamento.findOrFail(params.id)
    pagamento.merge(request.all())
    await pagamento.save()
    return pagamento
  }

  async destroy({ params }: HttpContext) {
    const pagamento = await Pagamento.findOrFail(params.id)
    await pagamento.delete()
    return { message: 'Lançamento financeiro removido com sucesso.' }
  }
}
