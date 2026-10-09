import {
  SolicitacaoCredito,
  type SolicitacaoStatus,
} from '../../Domain/Entities/SolicitacaoCredito.js'
import { type ISolicitacaoCreditoRepository } from '../../Domain/Repositories/ISolicitacaoCreditoRepository.js'
import SolicitacaoCreditoModel from '#models/SolicitacaoCredito'

/**
 * Concrete implementation of the credit request repository.
 * Maps between the domain entity {@link SolicitacaoCredito} and the Lucid ORM model.
 */
export class SolicitacaoCreditoRepositoryImpl implements ISolicitacaoCreditoRepository {
  /**
   * Persists a new credit request.
   */
  async create(solicitacao: SolicitacaoCredito): Promise<SolicitacaoCredito> {
    const model = await SolicitacaoCreditoModel.create({
      clienteId: solicitacao.clienteId,
      valor: solicitacao.valor,
      parcelas: solicitacao.parcelas,
      status: solicitacao.status,
    })
    return new SolicitacaoCredito(
      model.id,
      model.clienteId,
      model.valor,
      model.parcelas,
      model.status as SolicitacaoStatus,
      model.createdAt.toJSDate(),
      model.updatedAt.toJSDate()
    )
  }

  /**
   * Retrieves a request by its identifier.
   */
  async findById(id: number): Promise<SolicitacaoCredito | null> {
    const model = await SolicitacaoCreditoModel.find(id)
    if (!model) return null
    return new SolicitacaoCredito(
      model.id,
      model.clienteId,
      model.valor,
      model.parcelas,
      model.status as SolicitacaoStatus,
      model.createdAt.toJSDate(),
      model.updatedAt.toJSDate()
    )
  }

  /**
   * Returns all credit requests belonging to a specific client.
   */
  async findByClienteId(clienteId: number): Promise<SolicitacaoCredito[]> {
    const models = await SolicitacaoCreditoModel.query().where('cliente_id', clienteId)
    return models.map(
      (model) =>
        new SolicitacaoCredito(
          model.id,
          model.clienteId,
          model.valor,
          model.parcelas,
          model.status as SolicitacaoStatus,
          model.createdAt.toJSDate(),
          model.updatedAt.toJSDate()
        )
    )
  }

  /**
   * Updates an existing request (currently only status, valor or parcelas can be changed).
   */
  async update(solicitacao: SolicitacaoCredito): Promise<SolicitacaoCredito> {
    const model = await SolicitacaoCreditoModel.findOrFail(solicitacao.id)
    model.clienteId = solicitacao.clienteId
    model.valor = solicitacao.valor
    model.parcelas = solicitacao.parcelas
    model.status = solicitacao.status
    if (solicitacao.motivoRejeicao !== undefined) {
      model.motivoRejeicao = solicitacao.motivoRejeicao
    }
    await model.save()
    return solicitacao
  }
}
