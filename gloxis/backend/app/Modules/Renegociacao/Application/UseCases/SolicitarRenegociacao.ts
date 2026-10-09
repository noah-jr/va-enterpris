import { RenegociacaoEntity } from '../../Domain/Entities/RenegociacaoEntity.js'
import { type RenegociacaoRepositoryImpl } from '../../Infrastructure/Repositories/RenegociacaoRepositoryImpl.js'
import PagamentoModel from '#models/Pagamento'

export class SolicitarRenegociacao {
  constructor(private repo: RenegociacaoRepositoryImpl) {}

  public async execute(data: {
    solicitacaoId: number
    clienteId: number
    jurosMoraPerdoados: number
    multasPerdoadas: number
    novasParcelas: number
    novaTaxaJuros: number
  }): Promise<RenegociacaoEntity> {
    // Fetch all pending/overdue payments to calculate the total debt
    const pagamentos = await PagamentoModel.query()
      .where('solicitacao_id', data.solicitacaoId)
      .whereIn('status', ['PENDENTE', 'ATRASADO'])

    if (pagamentos.length === 0) {
      throw new Error('Nenhuma dívida pendente para renegociar.')
    }

    let saldoDevedorOriginal = 0
    for (const pag of pagamentos) {
      saldoDevedorOriginal +=
        Number(pag.valorParcela) + Number(pag.valorJurosMora) + Number(pag.valorMulta)
    }

    const novoSaldoDevedor = saldoDevedorOriginal - data.jurosMoraPerdoados - data.multasPerdoadas

    if (novoSaldoDevedor <= 0) {
      throw new Error('O novo saldo devedor não pode ser nulo ou negativo.')
    }

    const entity = new RenegociacaoEntity(
      null,
      data.solicitacaoId,
      data.clienteId,
      saldoDevedorOriginal,
      data.jurosMoraPerdoados,
      data.multasPerdoadas,
      novoSaldoDevedor,
      data.novasParcelas,
      data.novaTaxaJuros,
      'PENDENTE_APROVACAO',
      null
    )

    return await this.repo.save(entity)
  }
}
