import { GarantiaEntity } from '../../Domain/Entities/GarantiaEntity.js'
import GarantiaModel from '#models/Garantia'

export class GarantiaRepositoryImpl {
  public async save(entity: GarantiaEntity): Promise<GarantiaEntity> {
    const data = {
      solicitacaoId: entity.solicitacaoId,
      tipo: entity.tipo,
      valorEstimado: entity.valorEstimado,
      descricao: entity.descricao,
      detalhes: entity.detalhes,
      statusAvaliacao: entity.statusAvaliacao,
      valorAvaliado: entity.valorAvaliado,
      avaliadoPor: entity.avaliadoPor,
    }

    if (entity.id) {
      const model = await GarantiaModel.findOrFail(entity.id)
      model.merge(data)
      await model.save()
      entity.id = model.id
    } else {
      const model = await GarantiaModel.create(data)
      entity.id = model.id
    }

    return entity
  }

  public async findById(id: number): Promise<GarantiaEntity | null> {
    const model = await GarantiaModel.find(id)
    if (!model) return null

    return new GarantiaEntity(
      model.id,
      model.solicitacaoId,
      model.tipo,
      Number(model.valorEstimado),
      model.descricao,
      model.detalhes,
      model.statusAvaliacao,
      model.valorAvaliado ? Number(model.valorAvaliado) : null,
      model.avaliadoPor
    )
  }
}
