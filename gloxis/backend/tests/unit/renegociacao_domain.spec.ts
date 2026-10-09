import { test } from '@japa/runner'

export function calcularDescontoLiquidacaoAntecipada(
  saldoDevedor: number,
  jurosVincendos: number,
  percentualDesconto: number
): { valorFinal: number; descontoConcedido: number } {
  if (percentualDesconto < 0 || percentualDesconto > 100) {
    throw new Error('Percentual de desconto inválido')
  }
  const descontoConcedido = (jurosVincendos * percentualDesconto) / 100
  const valorFinal = saldoDevedor - descontoConcedido
  return {
    valorFinal: Math.max(0, valorFinal),
    descontoConcedido
  }
}

export function validarNovaPropostaRenegociacao(
  valorOriginal: number,
  novoPrazoMeses: number,
  taxaJuroMensal: number
): { elegivel: boolean; mensagem?: string } {
  if (novoPrazoMeses > 60) {
    return { elegivel: false, mensagem: 'Prazo máximo de renegociação excedido (60 meses)' }
  }
  if (taxaJuroMensal <= 0) {
    return { elegivel: false, mensagem: 'Taxa de juro deve ser superior a 0%' }
  }
  if (valorOriginal <= 0) {
    return { elegivel: false, mensagem: 'Valor de dívida deve ser maior que zero' }
  }
  return { elegivel: true }
}

test.group('Domínio - Renegociação & Liquidação Antecipada', () => {
  test('Deve calcular corretamente o desconto em juros vincendos na liquidação antecipada', ({ assert }) => {
    const saldoDevedor = 1000000
    const jurosVincendos = 200000
    const percentualDesconto = 50 // 50% de desconto sobre os juros vincendos

    const resultado = calcularDescontoLiquidacaoAntecipada(saldoDevedor, jurosVincendos, percentualDesconto)

    assert.equal(resultado.descontoConcedido, 100000)
    assert.equal(resultado.valorFinal, 900000)
  })

  test('Deve lançar erro para percentual de desconto fora dos limites (0-100%)', ({ assert }) => {
    assert.throws(
      () => calcularDescontoLiquidacaoAntecipada(500000, 50000, 150),
      'Percentual de desconto inválido'
    )
  })

  test('Deve validar proposta de renegociação rejeitando prazos superiores a 60 meses', ({ assert }) => {
    const validacao = validarNovaPropostaRenegociacao(500000, 72, 3.5)
    assert.isFalse(validacao.elegivel)
    assert.include(validacao.mensagem!, 'Prazo máximo')
  })

  test('Deve aprovar proposta de renegociação válida dentro das regras do BNA', ({ assert }) => {
    const validacao = validarNovaPropostaRenegociacao(750000, 36, 2.5)
    assert.isTrue(validacao.elegivel)
  })
})
