import { type IDesembolsoRepository } from '../../Domain/Repositories/IDesembolsoRepository.js'
import { Desembolso } from '../../Domain/Entities/Desembolso.js'
import DesembolsoModel from '#models/Desembolso'

export class DesembolsoRepositoryImpl implements IDesembolsoRepository {
  async create(desembolso: Desembolso): Promise<Desembolso> {
    const model = await DesembolsoModel.create({
      solicitacaoId: desembolso.solicitacaoId,
      valorDesembolsado: desembolso.valorDesembolsado,
      metodo: desembolso.metodo,
      comprovantePath: desembolso.comprovantePath,
      status: desembolso.status,
      dataDesembolso: desembolso.dataDesembolso as any,
    })

    return this.toEntity(model)
  }

  async findById(id: number): Promise<Desembolso | null> {
    const model = await DesembolsoModel.find(id)
    if (!model) return null
    return this.toEntity(model)
  }

  async findBySolicitacaoId(solicitacaoId: number): Promise<Desembolso | null> {
    const model = await DesembolsoModel.findBy('solicitacao_id', solicitacaoId)
    if (!model) return null
    return this.toEntity(model)
  }

  async update(desembolso: Desembolso): Promise<Desembolso> {
    if (!desembolso.id) throw new Error('ID required for update')
    const model = await DesembolsoModel.findOrFail(desembolso.id)

    model.valorDesembolsado = desembolso.valorDesembolsado
    model.metodo = desembolso.metodo
    model.comprovantePath = desembolso.comprovantePath
    model.status = desembolso.status
    model.dataDesembolso = desembolso.dataDesembolso as any

    await model.save()
    return this.toEntity(model)
  }

  private toEntity(model: DesembolsoModel): Desembolso {
    return new Desembolso(
      model.id,
      model.solicitacaoId,
      model.valorDesembolsado,
      model.metodo,
      model.comprovantePath,
      model.status,
      model.dataDesembolso?.toJSDate() || null,
      model.createdAt.toJSDate(),
      model.updatedAt.toJSDate()
    )
  }
}
