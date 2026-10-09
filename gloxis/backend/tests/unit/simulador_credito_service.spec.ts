import { test } from '@japa/runner'
import { SimuladorCreditoService } from '../../app/Modules/SolicitacaoCredito/Domain/Services/SimuladorCreditoService.js'
import { ProdutoCredito } from '../../app/Modules/ProdutoFinanceiro/Domain/Entities/ProdutoCredito.js'

test.group('Simulador Credito Service (Matemática Financeira - Tabela Price)', () => {
  test('Deve calcular corretamente um empréstimo de 10.000 a 5% a.m em 12 parcelas', ({
    assert,
  }) => {
    const simulador = new SimuladorCreditoService()

    // Typed Product Entity
    const produto = new ProdutoCredito(
      1,
      'Crédito Consumo',
      'Empréstimo Pessoal Consumo',
      0.05, // 5%
      3,
      24,
      1000,
      50000,
      true
    )

    const resultado = simulador.simular(produto, 10000, 12)

    // PMT = 10000 * 0.05 / (1 - (1 + 0.05)^-12) = 1128.25
    assert.equal(resultado.valorParcelaMensal, 1128.25)

    // Total Geral = 1128.25 * 12 = 13539
    assert.equal(resultado.totalGeralPagar, 13539)

    // Juros Total = 13539 - 10000 = 3539
    assert.equal(resultado.jurosTotalPagar, 3539)

    // Deve gerar 12 parcelas no cronograma
    assert.equal(resultado.cronograma.length, 12)

    // O saldo devedor da última parcela deve ser zerado (ou muito próximo de 0 devido a arredondamento)
    const ultimaParcela = resultado.cronograma[11]
    assert.equal(ultimaParcela.saldoDevedor, 0)
  })

  test('Deve rejeitar simulação se o valor solicitado for abaixo do mínimo', ({ assert }) => {
    const simulador = new SimuladorCreditoService()

    const produto = new ProdutoCredito(
      1,
      'Crédito Consumo',
      'Empréstimo Pessoal Consumo',
      0.05,
      3,
      24,
      5000,
      50000,
      true
    )

    assert.throws(() => {
      simulador.simular(produto, 1000, 12)
    }, 'O valor solicitado deve estar entre Kz 5000 e Kz 50000')
  })

  test('Deve rejeitar simulação se o produto estiver inativo', ({ assert }) => {
    const simulador = new SimuladorCreditoService()

    const produto = new ProdutoCredito(
      1,
      'Crédito Consumo',
      'Empréstimo Pessoal Consumo',
      0.05,
      3,
      24,
      5000,
      50000,
      false // INATIVO
    )

    assert.throws(() => {
      simulador.simular(produto, 10000, 12)
    }, 'Este produto de crédito não está ativo')
  })
})
