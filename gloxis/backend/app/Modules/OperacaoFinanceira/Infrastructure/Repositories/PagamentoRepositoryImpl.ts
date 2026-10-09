import { type IPagamentoRepository } from '../../Domain/Repositories/IPagamentoRepository.js'
import { Pagamento } from '../../Domain/Entities/Pagamento.js'
import PagamentoModel from '#models/Pagamento'

export class PagamentoRepositoryImpl implements IPagamentoRepository {
  async create(pagamento: Pagamento): Promise<Pagamento> {
    const model = await PagamentoModel.create({
      solicitacaoId: pagamento.solicitacaoId,
      numeroParcela: pagamento.numeroParcela,
      valorPago: pagamento.valorPago,
      valorJurosMora: pagamento.valorJurosMora,
      valorMulta: pagamento.valorMulta,
      metodo: pagamento.metodo,
      reciboPath: pagamento.reciboPath,
      status: pagamento.status,
      dataVencimento: pagamento.dataVencimento as any,
      dataPagamento: pagamento.dataPagamento as any,
    })

    return this.toEntity(model)
  }

  async findById(id: number): Promise<Pagamento | null> {
    const model = await PagamentoModel.find(id)
    if (!model) return null
    return this.toEntity(model)
  }

  async findBySolicitacaoId(solicitacaoId: number): Promise<Pagamento[]> {
    const models = await PagamentoModel.query()
      .where('solicitacao_id', solicitacaoId)
      .orderBy('numero_parcela', 'asc')
    return models.map((m) => this.toEntity(m))
  }

  async findPendentesAtrasados(dataAtual: Date): Promise<Pagamento[]> {
    const models = await PagamentoModel.query()
      .whereIn('status', ['PENDENTE', 'ATRASADO'])
      .andWhere('data_vencimento', '<', dataAtual)

    return models.map((m) => this.toEntity(m))
  }

  async update(pagamento: Pagamento): Promise<Pagamento> {
    if (!pagamento.id) throw new Error('ID required for update')
    const model = await PagamentoModel.findOrFail(pagamento.id)

    model.valorPago = pagamento.valorPago
    model.valorJurosMora = pagamento.valorJurosMora
    model.valorMulta = pagamento.valorMulta
    model.metodo = pagamento.metodo
    model.reciboPath = pagamento.reciboPath
    model.status = pagamento.status
    model.dataVencimento = pagamento.dataVencimento as any
    model.dataPagamento = pagamento.dataPagamento as any

    await model.save()
    return this.toEntity(model)
  }

  async updateBatch(pagamentos: Pagamento[]): Promise<void> {
    for (const pagamento of pagamentos) {
      await this.update(pagamento) // Naive implementation, can be optimized
    }
  }

  private toEntity(model: PagamentoModel): Pagamento {
    return new Pagamento(
      model.id,
      model.solicitacaoId || 0,
      model.numeroParcela || 1,
      model.valorPago || 0,
      model.valorJurosMora || 0,
      model.valorMulta || 0,
      model.metodo,
      model.reciboPath,
      model.status as any,
      model.dataVencimento ? model.dataVencimento.toJSDate() : new Date(),
      model.dataPagamento?.toJSDate() || null,
      model.createdAt ? model.createdAt.toJSDate() : new Date(),
      model.updatedAt ? model.updatedAt.toJSDate() : new Date()
    )
  }

  public async findAllPagamentos(): Promise<any[]> {
    const models = await PagamentoModel.query().orderBy('data_vencimento', 'desc')
    return models.map((m) => m.toJSON())
  }
}
