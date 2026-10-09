import { test } from '@japa/runner'
import { ProcessarInadimplencia } from '../../app/Modules/OperacaoFinanceira/Application/UseCases/ProcessarInadimplencia.js'
import { Pagamento } from '../../app/Modules/OperacaoFinanceira/Domain/Entities/Pagamento.js'
import { type IPagamentoRepository } from '../../app/Modules/OperacaoFinanceira/Domain/Repositories/IPagamentoRepository.js'

class MockPagamentoRepoForInadimplencia implements IPagamentoRepository {
  public pagamentos: Pagamento[] = []
  constructor(initial: Pagamento[]) {
    this.pagamentos = initial
  }
  async create(pagamento: Pagamento): Promise<Pagamento> {
    this.pagamentos.push(pagamento)
    return pagamento
  }
  async findById(id: number): Promise<Pagamento | null> {
    return this.pagamentos.find((p) => p.id === id) || null
  }
  async findBySolicitacaoId(solicitacaoId: number): Promise<Pagamento[]> {
    return this.pagamentos.filter((p) => p.solicitacaoId === solicitacaoId)
  }
  async findPendentesAtrasados(dataBase: Date): Promise<Pagamento[]> {
    return this.pagamentos.filter((p) => p.status === 'PENDENTE' && p.dataVencimento < dataBase)
  }
  async update(pagamento: Pagamento): Promise<Pagamento> {
    const idx = this.pagamentos.findIndex((p) => p.id === pagamento.id)
    if (idx !== -1) this.pagamentos[idx] = pagamento
    return pagamento
  }
  async updateBatch(pagamentos: Pagamento[]): Promise<void> {
    for (const p of pagamentos) {
      await this.update(p)
    }
  }
}

test.group('ProcessarInadimplencia (Unit)', () => {
  test('deve calcular multa (5%) e juros de mora (0.5% ao dia) para parcelas em atraso', async ({
    assert,
  }) => {
    const dataBase = new Date('2026-08-30T10:00:00Z')
    const vencimento = new Date('2026-08-20T10:00:00Z') // 10 dias de atraso

    const pagamentoAtrasado = new Pagamento(
      1,
      100,
      1,
      50000, // 50.000 Kz
      0,
      0,
      'TRANSFERENCIA',
      null,
      'PENDENTE',
      vencimento,
      null,
      new Date(),
      new Date()
    )

    const repo = new MockPagamentoRepoForInadimplencia([pagamentoAtrasado])
    const useCase = new ProcessarInadimplencia(repo)

    const res = await useCase.execute(dataBase)

    assert.equal(res.processados, 1)
    const atualizado = repo.pagamentos[0]
    assert.equal(atualizado.status, 'ATRASADO')
    // Multa: 50000 * 0.05 = 2500
    assert.equal(atualizado.valorMulta, 2500)
    // Juros Mora: 50000 * 0.005 * 10 dias = 2500
    assert.equal(atualizado.valorJurosMora, 2500)
  })

  test('deve retornar zero quando nao houver parcelas vencidas', async ({ assert }) => {
    const dataBase = new Date('2026-08-30T10:00:00Z')
    const vencimentoFuturo = new Date('2026-09-20T10:00:00Z')

    const pagamentoEmDia = new Pagamento(
      2,
      101,
      1,
      50000,
      0,
      0,
      'TRANSFERENCIA',
      null,
      'PENDENTE',
      vencimentoFuturo,
      null,
      new Date(),
      new Date()
    )

    const repo = new MockPagamentoRepoForInadimplencia([pagamentoEmDia])
    const useCase = new ProcessarInadimplencia(repo)

    const res = await useCase.execute(dataBase)

    assert.equal(res.processados, 0)
    assert.equal(repo.pagamentos[0].status, 'PENDENTE')
  })
})
