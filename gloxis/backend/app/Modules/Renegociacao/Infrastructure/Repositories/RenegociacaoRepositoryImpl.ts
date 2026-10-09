import { RenegociacaoEntity } from '../../Domain/Entities/RenegociacaoEntity.js'
import RenegociacaoModel from '#models/Renegociacao'

export class RenegociacaoRepositoryImpl {
  public async save(entity: RenegociacaoEntity): Promise<RenegociacaoEntity> {
    const data = {
      solicitacaoId: entity.solicitacaoId,
      clienteId: entity.clienteId,
      saldoDevedorOriginal: entity.saldoDevedorOriginal,
      jurosMoraPerdoados: entity.jurosMoraPerdoados,
      multasPerdoadas: entity.multasPerdoadas,
      novoSaldoDevedor: entity.novoSaldoDevedor,
      novasParcelas: entity.novasParcelas,
      novaTaxaJuros: entity.novaTaxaJuros,
      status: entity.status,
      aprovadoPor: entity.aprovadoPor,
    }

    if (entity.id) {
      const model = await RenegociacaoModel.findOrFail(entity.id)
      model.merge(data)
      await model.save()
      entity.id = model.id
    } else {
      const model = await RenegociacaoModel.create(data)
      entity.id = model.id
    }

    return entity
  }

  public async findById(id: number): Promise<RenegociacaoEntity | null> {
    const model = await RenegociacaoModel.find(id)
    if (!model) return null

    return new RenegociacaoEntity(
      model.id,
      model.solicitacaoId,
      model.clienteId,
      Number(model.saldoDevedorOriginal),
      Number(model.jurosMoraPerdoados),
      Number(model.multasPerdoadas),
      Number(model.novoSaldoDevedor),
      model.novasParcelas,
      Number(model.novaTaxaJuros),
      model.status,
      model.aprovadoPor
    )
  }

  public async findAll(): Promise<any[]> {
    const models = await RenegociacaoModel.all()
    return models.map((m) => m.toJSON())
  }
}
