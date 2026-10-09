import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export interface AdminKPIs {
  totalClientes: number
  clientesAtivos: number
  clientesNaListaNegra: number
  solicitacoesTotal: number
  solicitacoesAprovadas: number
  solicitacoesReprovadas: number
  solicitacoesPendentes: number
  taxaAprovacao: number
  totalDesembolsado: number
  totalRecebidoPagamentos: number
  totalJurosRecebidos: number
  saldoCarteiraTotalDevedor: number
  totalClientesInadimplentes: number
  valorTotalAtrasado: number
  taxaInadimplencia: number
  erp: {
    totalVendas: number
    valorTotalVendas: number
    totalCompras: number
    valorTotalCompras: number
    totalFuncionarios: number
    totalItensStock: number
  }
  history: any[]
  geradoEm: string
}

export class ObterKPIsAdmin {
  async execute(dias: number = 30): Promise<AdminKPIs> {
    const dataLimite = DateTime.now().minus({ days: dias }).toSQLDate()!
    const [
      clientesCount,
      clientesNaListaNegraCount,
      solicitacoesCount,
      solicitacoesAprovadas,
      solicitacoesReprovadas,
      solicitacoesPendentes,
      resultEmprestado,
      resultRecebido,
      resultAtrasado,
      resultPendentes,
      vendasCount,
      vendasValor,
      comprasCount,
      comprasValor,
      funcionariosCount,
      stockCount,
    ] = await Promise.all([
      db.from('clientes').where('created_at', '>=', dataLimite).count('* as total'),
      db
        .from('lista_negras')
        .where('created_at', '>=', dataLimite)
        .whereNull('data_remocao')
        .count('* as total'),
      db.from('solicitacao_creditos').where('created_at', '>=', dataLimite).count('* as total'),
      db
        .from('solicitacao_creditos')
        .where('created_at', '>=', dataLimite)
        .whereIn('status', ['APROVADA', 'DESEMBOLSADA'])
        .count('* as total'),
      db
        .from('solicitacao_creditos')
        .where('created_at', '>=', dataLimite)
        .where('status', 'REPROVADA')
        .count('* as total'),
      db
        .from('solicitacao_creditos')
        .where('created_at', '>=', dataLimite)
        .where('status', 'PENDENTE')
        .count('* as total'),
      db
        .from('solicitacao_creditos')
        .where('created_at', '>=', dataLimite)
        .whereIn('status', ['APROVADA', 'DESEMBOLSADA'])
        .sum('valor as total'),
      db
        .from('pagamentos')
        .where('created_at', '>=', dataLimite)
        .where('status', 'PROCESSADO')
        .sum('valor_pago as total')
        .sum('valor_juros_mora as juros')
        .sum('valor_multa as multa'),
      db
        .from('pagamentos')
        .where('created_at', '>=', dataLimite)
        .where('status', 'ATRASADO')
        .sum('valor_parcela as total')
        .countDistinct('solicitacao_id as inadimplentes'),
      db
        .from('pagamentos')
        .where('created_at', '>=', dataLimite)
        .where('status', 'PENDENTE')
        .sum('valor_parcela as total'),
      db.from('vendas').where('created_at', '>=', dataLimite).count('* as total'),
      db
        .from('vendas')
        .where('created_at', '>=', dataLimite)
        .where('status', 'PAGO')
        .sum('valor as total'),
      db.from('compras').where('created_at', '>=', dataLimite).count('* as total'),
      db
        .from('compras')
        .where('created_at', '>=', dataLimite)
        .where('status', 'PAGO')
        .sum('valor as total'),
      db.from('funcionarios').where('created_at', '>=', dataLimite).count('* as total'),
      db.from('stock_items').where('created_at', '>=', dataLimite).count('* as total'),
    ])

    // Busca historico temporal para os graficos
    const historico = await Promise.all([
      db
        .from('vendas')
        .select(db.raw('DATE(created_at) as data'))
        .sum('valor as total_vendas')
        .where('created_at', '>=', dataLimite)
        .groupBy('data')
        .orderBy('data', 'asc'),
      db
        .from('compras')
        .select(db.raw('DATE(created_at) as data'))
        .sum('valor as total_compras')
        .where('created_at', '>=', dataLimite)
        .groupBy('data')
        .orderBy('data', 'asc'),
      db
        .from('solicitacao_creditos')
        .select(db.raw('DATE(created_at) as data'))
        .count('* as total_solicitacoes')
        .where('created_at', '>=', dataLimite)
        .groupBy('data')
        .orderBy('data', 'asc'),
      db
        .from('clientes')
        .select(db.raw('DATE(created_at) as data'))
        .count('* as total_clientes')
        .where('created_at', '>=', dataLimite)
        .groupBy('data')
        .orderBy('data', 'asc'),
    ])

    // Combinar o histórico num array unificado por data
    const historyMap = new Map<string, any>()
    const processHistory = (data: any[], key: string) => {
      data.forEach((item) => {
        let dateStr = item.data
        if (dateStr instanceof Date) {
          dateStr = dateStr.toISOString().split('T')[0]
        } else if (typeof dateStr !== 'string') {
          dateStr = String(dateStr)
        }

        if (!historyMap.has(dateStr))
          historyMap.set(dateStr, {
            data: dateStr,
            vendas: 0,
            compras: 0,
            solicitacoes: 0,
            clientes: 0,
          })
        historyMap.get(dateStr)![key] =
          Number.parseFloat(
            item[
              key === 'vendas'
                ? 'total_vendas'
                : key === 'compras'
                  ? 'total_compras'
                  : key === 'solicitacoes'
                    ? 'total_solicitacoes'
                    : 'total_clientes'
            ]
          ) || 0
      })
    }

    processHistory(historico[0], 'vendas')
    processHistory(historico[1], 'compras')
    processHistory(historico[2], 'solicitacoes')
    processHistory(historico[3], 'clientes')

    const history = Array.from(historyMap.values()).sort((a, b) =>
      String(a.data).localeCompare(String(b.data))
    )

    const totalClientes = Number(clientesCount[0].total) || 0
    const totalSolicitacoes = Number(solicitacoesCount[0].total) || 0
    const aprovadas = Number(solicitacoesAprovadas[0].total) || 0

    const totalEmprestado = Number.parseFloat(resultEmprestado[0].total) || 0
    const totalRecebido = Number.parseFloat(resultRecebido[0].total) || 0
    const totalJuros =
      (Number.parseFloat(resultRecebido[0].juros) || 0) +
      (Number.parseFloat(resultRecebido[0].multa) || 0)
    const totalEmAtraso = Number.parseFloat(resultAtrasado[0].total) || 0
    const saldoCarteira = (Number.parseFloat(resultPendentes[0].total) || 0) + totalEmAtraso

    let taxaAprovacao = 0
    if (totalSolicitacoes > 0) {
      taxaAprovacao = (aprovadas / totalSolicitacoes) * 100
    }

    let taxaInadimplencia = 0
    if (totalEmprestado > 0) {
      taxaInadimplencia = (totalEmAtraso / totalEmprestado) * 100
    }

    return {
      totalClientes,
      clientesAtivos: totalClientes, // simplified
      clientesNaListaNegra: Number(clientesNaListaNegraCount[0].total) || 0,
      solicitacoesTotal: totalSolicitacoes,
      solicitacoesAprovadas: aprovadas,
      solicitacoesReprovadas: Number(solicitacoesReprovadas[0].total) || 0,
      solicitacoesPendentes: Number(solicitacoesPendentes[0].total) || 0,
      taxaAprovacao: Math.round(taxaAprovacao * 100) / 100,
      totalDesembolsado: totalEmprestado,
      totalRecebidoPagamentos: totalRecebido,
      totalJurosRecebidos: totalJuros,
      saldoCarteiraTotalDevedor: saldoCarteira,
      totalClientesInadimplentes: Number(resultAtrasado[0].inadimplentes) || 0,
      valorTotalAtrasado: totalEmAtraso,
      taxaInadimplencia: Math.round(taxaInadimplencia * 100) / 100,
      erp: {
        totalVendas: Number(vendasCount[0].total) || 0,
        valorTotalVendas: Number.parseFloat(vendasValor[0]?.total || 0),
        totalCompras: Number(comprasCount[0].total) || 0,
        valorTotalCompras: Number.parseFloat(comprasValor[0]?.total || 0),
        totalFuncionarios: Number(funcionariosCount[0].total) || 0,
        totalItensStock: Number(stockCount[0].total) || 0,
      },
      history,
      geradoEm: DateTime.now().toISO()!,
    }
  }
}
