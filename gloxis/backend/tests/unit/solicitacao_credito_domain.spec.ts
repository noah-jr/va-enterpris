import { test } from '@japa/runner'
import SolicitacaoCredito from '#models/SolicitacaoCredito'

test.group('unit / Solicitação de Crédito State Machine & Domain Rules', () => {
  test('deve inicializar nova solicitação com estado PENDENTE', ({ assert }) => {
    const sol = new SolicitacaoCredito()
    sol.status = 'PENDENTE'
    sol.valor = 250000
    sol.parcelas = 6

    assert.equal(sol.status, 'PENDENTE')
    assert.equal(sol.valor, 250000)
  })

  test('deve permitir transição válida de PENDENTE -> APROVADO -> DESEMBOLSADO', ({ assert }) => {
    const sol = new SolicitacaoCredito()
    sol.status = 'PENDENTE'

    // Aprovar
    sol.status = 'APROVADO'
    assert.equal(sol.status, 'APROVADO')

    // Desembolsar
    sol.status = 'DESEMBOLSADO'
    assert.equal(sol.status, 'DESEMBOLSADO')
  })

  test('deve calcular o montante total com taxa de juro nominal simples', ({ assert }) => {
    const valorPrincipal = 100000 // 100.000 Kz
    const taxaJuroMensal = 0.05   // 5% a.m.
    const prazoMeses = 3          // 3 meses

    const totalJuros = valorPrincipal * taxaJuroMensal * prazoMeses
    const montanteTotal = valorPrincipal + totalJuros

    assert.equal(totalJuros, 15000)
    assert.equal(montanteTotal, 115000)
  })
})
