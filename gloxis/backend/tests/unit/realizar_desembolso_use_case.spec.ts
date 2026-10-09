import { test } from '@japa/runner'
import { RealizarDesembolso } from '../../app/Modules/OperacaoFinanceira/Application/UseCases/RealizarDesembolso.js'
import { Desembolso } from '../../app/Modules/OperacaoFinanceira/Domain/Entities/Desembolso.js'
import { type IDesembolsoRepository } from '../../app/Modules/OperacaoFinanceira/Domain/Repositories/IDesembolsoRepository.js'
import { type IPagamentoRepository } from '../../app/Modules/OperacaoFinanceira/Domain/Repositories/IPagamentoRepository.js'
import { type Pagamento } from '../../app/Modules/OperacaoFinanceira/Domain/Entities/Pagamento.js'
import { type ISolicitacaoCreditoRepository } from '../../app/Modules/SolicitacaoCredito/Domain/Repositories/ISolicitacaoCreditoRepository.js'
import {
  SolicitacaoCredito,
  type SolicitacaoStatus,
} from '../../app/Modules/SolicitacaoCredito/Domain/Entities/SolicitacaoCredito.js'
import { type IProdutoCreditoRepository } from '../../app/Modules/ProdutoFinanceiro/Domain/Repositories/IProdutoCreditoRepository.js'
import { ProdutoCredito } from '../../app/Modules/ProdutoFinanceiro/Domain/Entities/ProdutoCredito.js'

class MockDesembolsoRepo implements IDesembolsoRepository {
  private desembolsos: Desembolso[] = []
  async create(desembolso: Desembolso): Promise<Desembolso> {
    const saved = new Desembolso(
      this.desembolsos.length + 1,
      desembolso.solicitacaoId,
      desembolso.valorDesembolsado,
      desembolso.metodo,
      desembolso.comprovantePath,
      desembolso.status,
      desembolso.dataDesembolso,
      desembolso.createdAt,
      desembolso.updatedAt
    )
    this.desembolsos.push(saved)
    return saved
  }
  async findById(id: number): Promise<Desembolso | null> {
    return this.desembolsos.find((d) => d.id === id) || null
  }
  async findBySolicitacaoId(solicitacaoId: number): Promise<Desembolso | null> {
    return this.desembolsos.find((d) => d.solicitacaoId === solicitacaoId) || null
  }
  async update(desembolso: Desembolso): Promise<Desembolso> {
    const idx = this.desembolsos.findIndex((d) => d.id === desembolso.id)
    if (idx !== -1) this.desembolsos[idx] = desembolso
    return desembolso
  }
}

class MockSolicitacaoRepo implements ISolicitacaoCreditoRepository {
  private solicitacoes: SolicitacaoCredito[] = []
  constructor(initial: SolicitacaoCredito[]) {
    this.solicitacoes = initial
  }
  async create(solicitacao: SolicitacaoCredito): Promise<SolicitacaoCredito> {
    this.solicitacoes.push(solicitacao)
    return solicitacao
  }
  async findById(id: number): Promise<SolicitacaoCredito | null> {
    return this.solicitacoes.find((s) => s.id === id) || null
  }
  async findByClienteId(clienteId: number): Promise<SolicitacaoCredito[]> {
    return this.solicitacoes.filter((s) => s.clienteId === clienteId)
  }
  async update(solicitacao: SolicitacaoCredito): Promise<SolicitacaoCredito> {
    const idx = this.solicitacoes.findIndex((s) => s.id === solicitacao.id)
    if (idx !== -1) this.solicitacoes[idx] = solicitacao
    return solicitacao
  }
  async updateStatus(id: number, status: SolicitacaoStatus): Promise<void> {
    const sol = await this.findById(id)
    if (sol) sol.status = status
  }
}

class MockProdutoRepo implements IProdutoCreditoRepository {
  async findById(id: number): Promise<ProdutoCredito | null> {
    if (id === 1) {
      return new ProdutoCredito(
        1,
        'Microcrédito Pessoal',
        'Descrição',
        0.02,
        6,
        36,
        10000,
        10000000,
        true
      )
    }
    return null
  }
  async listAll(): Promise<ProdutoCredito[]> {
    return []
  }
  async findAllAtivos(): Promise<ProdutoCredito[]> {
    return []
  }
  async create(produto: ProdutoCredito): Promise<ProdutoCredito> {
    return produto
  }
}

class MockPagamentoRepo implements IPagamentoRepository {
  public pagamentos: Pagamento[] = []
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
  async findPendentesAtrasados(): Promise<Pagamento[]> {
    return []
  }
  async update(pagamento: Pagamento): Promise<Pagamento> {
    return pagamento
  }
  async updateBatch(): Promise<void> {}
}

test.group('RealizarDesembolso (Unit)', () => {
  test('deve realizar desembolso e gerar cronograma de parcelas pendentes com sucesso', async ({
    assert,
  }) => {
    const solicitacaoAprovada = new SolicitacaoCredito(
      1,
      10,
      500000,
      12,
      'APROVADO',
      new Date(),
      new Date()
    )

    const desembolsoRepo = new MockDesembolsoRepo()
    const solicitacaoRepo = new MockSolicitacaoRepo([solicitacaoAprovada])
    const produtoRepo = new MockProdutoRepo()
    const pagamentoRepo = new MockPagamentoRepo()

    const useCase = new RealizarDesembolso(
      desembolsoRepo,
      solicitacaoRepo,
      produtoRepo,
      pagamentoRepo
    )

    const desembolso = await useCase.execute(1, 'TRANSFERENCIA', '/comprovantes/doc.pdf')

    assert.equal(desembolso.solicitacaoId, 1)
    assert.equal(desembolso.valorDesembolsado, 500000)
    assert.equal(desembolso.status, 'REALIZADO')
    assert.equal(pagamentoRepo.pagamentos.length, 12)
    assert.equal(pagamentoRepo.pagamentos[0].status, 'PENDENTE')
  })

  test('deve lancar erro ao tentar desembolsar solicitacao nao aprovada', async ({ assert }) => {
    const solicitacaoPendente = new SolicitacaoCredito(
      2,
      10,
      500000,
      12,
      'PENDENTE',
      new Date(),
      new Date()
    )

    const desembolsoRepo = new MockDesembolsoRepo()
    const solicitacaoRepo = new MockSolicitacaoRepo([solicitacaoPendente])
    const produtoRepo = new MockProdutoRepo()
    const pagamentoRepo = new MockPagamentoRepo()

    const useCase = new RealizarDesembolso(
      desembolsoRepo,
      solicitacaoRepo,
      produtoRepo,
      pagamentoRepo
    )

    await assert.rejects(
      async () => useCase.execute(2, 'TRANSFERENCIA', null),
      'Apenas solicitações aprovadas podem ser desembolsadas.'
    )
  })
})
