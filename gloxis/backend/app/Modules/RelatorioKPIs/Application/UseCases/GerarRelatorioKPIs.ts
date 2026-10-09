import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export interface KpiSnapshot {
  // Clientes
  totalClientes: number
  clientesAtivos: number
  clientesNaListaNegra: number

  // Crédito
  solicitacoesTotal: number
  solicitacoesAprovadas: number
  solicitacoesReprovadas: number
  solicitacoesPendentes: number
  taxaAprovacao: number

  // Financeiro
  totalDesembolsado: number
  totalRecebidoPagamentos: number
  totalJurosRecebidos: number
  saldoCarteiraTotalDevedor: number

  // Inadimplência
  totalClientesInadimplentes: number
  valorTotalAtrasado: number
  taxaInadimplencia: number

  // Período
  geradoEm: string
}

export class GerarRelatorioKPIs {
  async execute(): Promise<KpiSnapshot> {
    // --- Clientes ---
    const totalClientes = await db.from('clientes').count('* as total').first()
    const clientesNaListaNegra = await db
      .from('lista_negras')
      .where('ativo', true)
      .count('* as total')
      .first()

    // --- Solicitações ---
    const solicitacoesStats = await db
      .from('solicitacao_creditos')
      .select(db.raw('COUNT(*) as total'))
      .select(
        db.raw(
          `SUM(CASE WHEN status = 'APROVADO' OR status = 'DESEMBOLSADO' THEN 1 ELSE 0 END) as aprovadas`
        )
      )
      .select(db.raw(`SUM(CASE WHEN status = 'REPROVADO' THEN 1 ELSE 0 END) as reprovadas`))
      .select(
        db.raw(
          `SUM(CASE WHEN status = 'EM_ANALISE' OR status = 'PENDENTE' THEN 1 ELSE 0 END) as pendentes`
        )
      )
      .first()

    const total = Number(solicitacoesStats?.total || 0)
    const aprovadas = Number(solicitacoesStats?.aprovadas || 0)
    const taxaAprovacao = total > 0 ? Math.round((aprovadas / total) * 100) : 0

    // --- Financeiro ---
    const desembolsos = await db.from('desembolsos').sum('valor as total').first()
    const pagamentosStats = await db
      .from('pagamentos')
      .where('status', 'PAGO')
      .select(db.raw('SUM(valor_pago) as total_recebido'))
      .select(db.raw('SUM(juros_mora) as total_juros'))
      .first()

    // Saldo devedor = soma de valorParcela das parcelas ainda PENDENTE ou ATRASADO
    const saldoCarteira = await db
      .from('pagamentos')
      .whereIn('status', ['PENDENTE', 'ATRASADO'])
      .sum('valor_parcela as total')
      .first()

    // --- Inadimplência ---
    const clientesInadimplentes = await db
      .from('pagamentos')
      .join('solicitacao_creditos', 'pagamentos.solicitacao_id', 'solicitacao_creditos.id')
      .where('pagamentos.status', 'ATRASADO')
      .countDistinct('solicitacao_creditos.cliente_id as total')
      .first()

    const valorAtrasado = await db
      .from('pagamentos')
      .where('status', 'ATRASADO')
      .sum('valor_parcela as total')
      .first()

    const clientesAtivos =
      Number(totalClientes?.total || 0) - Number(clientesNaListaNegra?.total || 0)
    const totalInadimplentes = Number(clientesInadimplentes?.total || 0)
    const taxaInadimplencia =
      clientesAtivos > 0 ? Math.round((totalInadimplentes / clientesAtivos) * 100) : 0

    return {
      totalClientes: Number(totalClientes?.total || 0),
      clientesAtivos,
      clientesNaListaNegra: Number(clientesNaListaNegra?.total || 0),

      solicitacoesTotal: total,
      solicitacoesAprovadas: aprovadas,
      solicitacoesReprovadas: Number(solicitacoesStats?.reprovadas || 0),
      solicitacoesPendentes: Number(solicitacoesStats?.pendentes || 0),
      taxaAprovacao,

      totalDesembolsado: Number(desembolsos?.total || 0),
      totalRecebidoPagamentos: Number(pagamentosStats?.total_recebido || 0),
      totalJurosRecebidos: Number(pagamentosStats?.total_juros || 0),
      saldoCarteiraTotalDevedor: Number(saldoCarteira?.total || 0),

      totalClientesInadimplentes: totalInadimplentes,
      valorTotalAtrasado: Number(valorAtrasado?.total || 0),
      taxaInadimplencia,

      geradoEm: DateTime.now().toISO()!,
    }
  }
}
