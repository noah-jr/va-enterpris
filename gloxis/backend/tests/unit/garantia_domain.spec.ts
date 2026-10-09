import { test } from '@japa/runner'

export interface GarantiaValiacao {
  tipo: 'IMOVEL' | 'VEICULO' | 'EQUIPAMENTO' | 'DEPOSITO_CAUCAO'
  valorAvaliado: number
  valorSolicitado: number
  ltvMaximoPercentual: number
}

export function calcularLTV(valorSolicitado: number, valorAvaliadoGarantia: number): number {
  if (valorAvaliadoGarantia <= 0) return 100
  return Number(((valorSolicitado / valorAvaliadoGarantia) * 100).toFixed(2))
}

export function validarElegibilidadeGarantia(params: GarantiaValiacao): { aceito: boolean; ltvCalculado: number; motivo?: string } {
  const ltv = calcularLTV(params.valorSolicitado, params.valorAvaliado)
  
  if (ltv > params.ltvMaximoPercentual) {
    return {
      aceito: false,
      ltvCalculado: ltv,
      motivo: `LTV de ${ltv}% excede o limite máximo permitido para ${params.tipo} (${params.ltvMaximoPercentual}%)`
    }
  }

  return {
    aceito: true,
    ltvCalculado: ltv
  }
}

test.group('Domínio - Avaliação de Garantias e Colaterais (LTV)', () => {
  test('Deve calcular corretamente a rácio Loan-to-Value (LTV)', ({ assert }) => {
    const ltv = calcularLTV(5000000, 10000000)
    assert.equal(ltv, 50.00)
  })

  test('Deve rejeitar garantia com LTV acima do limite normativo do BNA', ({ assert }) => {
    const avaliacao = validarElegibilidadeGarantia({
      tipo: 'VEICULO',
      valorSolicitado: 8000000,
      valorAvaliado: 10000000,
      ltvMaximoPercentual: 70 // Limite de 70% para veículos
    })

    assert.isFalse(avaliacao.aceito)
    assert.equal(avaliacao.ltvCalculado, 80.00)
    assert.include(avaliacao.motivo!, 'excede o limite')
  })

  test('Deve aprovar garantia imobiliária com LTV seguro (50%)', ({ assert }) => {
    const avaliacao = validarElegibilidadeGarantia({
      tipo: 'IMOVEL',
      valorSolicitado: 15000000,
      valorAvaliado: 30000000,
      ltvMaximoPercentual: 75
    })

    assert.isTrue(avaliacao.aceito)
    assert.equal(avaliacao.ltvCalculado, 50.00)
  })
})
