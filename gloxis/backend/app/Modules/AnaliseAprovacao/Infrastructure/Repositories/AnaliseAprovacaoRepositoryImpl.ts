import { type IAnaliseAprovacaoRepository } from '../../Domain/Repositories/IAnaliseAprovacaoRepository.js'
import { AnaliseAprovacao } from '../../Domain/Entities/AnaliseAprovacao.js'
import AnaliseAprovacaoModel from '#models/AnaliseAprovacao'

export class AnaliseAprovacaoRepositoryImpl implements IAnaliseAprovacaoRepository {
  async create(analise: AnaliseAprovacao): Promise<AnaliseAprovacao> {
    const model = await AnaliseAprovacaoModel.create({
      solicitacaoId: analise.solicitacaoId,
      decision: analise.decision,
      scoreFinal: analise.score,
      justificativa: analise.motivo,
    })

    return new AnaliseAprovacao(
      model.id,
      model.solicitacaoId,
      model.scoreFinal,
      model.decision,
      model.justificativa,
      model.createdAt.toJSDate(),
      model.updatedAt.toJSDate()
    )
  }

  async findById(id: number): Promise<AnaliseAprovacao | null> {
    const model = await AnaliseAprovacaoModel.find(id)
    if (!model) return null

    return new AnaliseAprovacao(
      model.id,
      model.solicitacaoId,
      model.scoreFinal,
      model.decision,
      model.justificativa,
      model.createdAt.toJSDate(),
      model.updatedAt.toJSDate()
    )
  }

  async findBySolicitacaoId(solicitacaoId: number): Promise<AnaliseAprovacao | null> {
    const model = await AnaliseAprovacaoModel.findBy('solicitacao_id', solicitacaoId)
    if (!model) return null

    return new AnaliseAprovacao(
      model.id,
      model.solicitacaoId,
      model.scoreFinal,
      model.decision,
      model.justificativa,
      model.createdAt.toJSDate(),
      model.updatedAt.toJSDate()
    )
  }

  async update(analise: AnaliseAprovacao): Promise<AnaliseAprovacao> {
    if (!analise.id) throw new Error('ID needed for update')
    const model = await AnaliseAprovacaoModel.findOrFail(analise.id)

    model.decision = analise.decision
    model.scoreFinal = analise.score
    model.justificativa = analise.motivo

    await model.save()

    return analise
  }
}
