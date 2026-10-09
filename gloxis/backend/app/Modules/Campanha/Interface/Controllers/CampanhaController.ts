import type { HttpContext } from '@adonisjs/core/http'
import Campanha from '#models/campanha'
import { DateTime } from 'luxon'
import { PaginationHelper } from '../../../Core/Application/DTOs/PaginationDTO.js'

export default class CampanhaController {
  public async index({ request, response }: HttpContext) {
    const { page, perPage } = PaginationHelper.normalizeParams(
      request.input('page'),
      request.input('perPage'),
      10
    )
    const search = request.input('search')
    const query = Campanha.query().orderBy('id', 'desc')

    if (search) {
      query.where((q) => {
        q.where('nome', 'like', `%${search}%`).orWhere('descricao', 'like', `%${search}%`)
      })
    }

    const paginated = await query.paginate(page, perPage)
    return response.ok(paginated.toJSON())
  }

  public async ativas({ response }: HttpContext) {
    const campanhas = await Campanha.query()
      .where('ativo', true)
      .where('dataInicio', '<=', DateTime.now().toSQL()!)
      .where('dataFim', '>=', DateTime.now().toSQL()!)

    return response.ok({ data: campanhas })
  }

  public async store({ request, response }: HttpContext) {
    const payload = request.only([
      'nome',
      'descricao',
      'descontoTaxaJuros',
      'percentualCashback',
      'dataInicio',
      'dataFim',
      'ativo',
    ])

    const campanha = await Campanha.create({
      ...payload,
      dataInicio: DateTime.fromISO(payload.dataInicio),
      dataFim: DateTime.fromISO(payload.dataFim),
    })

    return response.created({ data: campanha, message: 'Campanha criada com sucesso' })
  }

  public async update({ params, request, response }: HttpContext) {
    const campanha = await Campanha.findOrFail(params.id)
    const payload = request.only([
      'nome',
      'descricao',
      'descontoTaxaJuros',
      'percentualCashback',
      'dataInicio',
      'dataFim',
      'ativo',
    ])

    if (payload.dataInicio) payload.dataInicio = DateTime.fromISO(payload.dataInicio) as any
    if (payload.dataFim) payload.dataFim = DateTime.fromISO(payload.dataFim) as any

    campanha.merge(payload)
    await campanha.save()

    return response.ok({ data: campanha, message: 'Campanha atualizada com sucesso' })
  }

  public async destroy({ params, response }: HttpContext) {
    const campanha = await Campanha.findOrFail(params.id)
    await campanha.delete()
    return response.ok({ message: 'Campanha eliminada' })
  }
}
