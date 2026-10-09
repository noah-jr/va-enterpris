import { type ProdutoCredito } from '../../../ProdutoFinanceiro/Domain/Entities/ProdutoCredito.js'

export interface ItemCronograma {
  mes: number
  valorParcela: number
  juros: number
  amortizacao: number
  saldoDevedor: number
}

export interface SimulacaoCreditoResult {
  produtoNome: string
  valorSolicitado: number
  numeroParcelas: number
  taxaJurosMensal: number
  valorParcelaMensal: number
  jurosTotalPagar: number
  totalGeralPagar: number
  cronograma: ItemCronograma[]
}

export class SimuladorCreditoService {
  public simular(
    produto: ProdutoCredito,
    valorSolicitado: number,
    numeroParcelas: number,
    descontoTaxa: number = 0
  ): SimulacaoCreditoResult {
    if (!produto.ativo) throw new Error('Este produto de crédito não está ativo')
    if (valorSolicitado < produto.valorMinimo || valorSolicitado > produto.valorMaximo) {
      throw new Error(
        `O valor solicitado deve estar entre Kz ${produto.valorMinimo} e Kz ${produto.valorMaximo}`
      )
    }
    if (numeroParcelas < produto.prazoMinimoMeses || numeroParcelas > produto.prazoMaximoMeses) {
      throw new Error(
        `O número de parcelas deve ser entre ${produto.prazoMinimoMeses} e ${produto.prazoMaximoMeses}`
      )
    }

    // Cálculo Tabela Price (Parcelas fixas)
    // PMT = PV * i / (1 - (1 + i)^-n)
    let i = produto.taxaJurosMensal
    if (descontoTaxa > 0) {
      i = Math.max(0, i - (i * descontoTaxa) / 100) // Aplica percentagem de desconto
    }

    const n = numeroParcelas
    const pv = valorSolicitado

    const pmt = (pv * i) / (1 - Math.pow(1 + i, -n))
    const valorParcela = Math.round(pmt * 100) / 100

    const totalPagar = Math.round(valorParcela * n * 100) / 100
    const jurosTotal = Math.round((totalPagar - pv) * 100) / 100

    // Gerar cronograma (amortização)
    const cronograma: ItemCronograma[] = []
    let saldoDevedor = pv

    for (let mes = 1; mes <= n; mes++) {
      const jurosDaParcela = Math.round(saldoDevedor * i * 100) / 100
      const amortizacao = Math.round((valorParcela - jurosDaParcela) * 100) / 100

      saldoDevedor = Math.round((saldoDevedor - amortizacao) * 100) / 100
      if (saldoDevedor < 0 || mes === n) saldoDevedor = 0 // Ajuste residual na última parcela

      cronograma.push({
        mes,
        valorParcela,
        juros: jurosDaParcela,
        amortizacao,
        saldoDevedor,
      })
    }

    return {
      produtoNome: produto.nome,
      valorSolicitado,
      numeroParcelas,
      taxaJurosMensal: produto.taxaJurosMensal,
      valorParcelaMensal: valorParcela,
      jurosTotalPagar: jurosTotal,
      totalGeralPagar: totalPagar,
      cronograma,
    }
  }
}
