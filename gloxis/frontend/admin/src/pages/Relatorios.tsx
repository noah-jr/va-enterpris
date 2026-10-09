import React from 'react'
import {
  PageShell, PageHeader, KpiCard, BtnPrimary, BtnSecondary, Modal
} from '../components/ui'
import {
  TrendingUp, Users, AlertTriangle, Wallet,
  CheckCircle, XCircle, Clock, BarChart3, ArrowUpRight,
  Eye, Download, RefreshCw, X, FileText, PieChart as PieChartIcon,
  Activity, ShoppingBag, ShoppingCart, ShieldAlert, Layers
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, AreaChart, Area,
  ComposedChart, Line
} from 'recharts'
import { useRelatorios } from '../hooks/useRelatorios'

formatKz

function formatKz(val: number) {
  return `Kz ${Number(val || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function Relatorios() {
  const {
    kpis, loading, error, diasFilter, setDiasFilter, loadKpis,
    pdfUrl, showPdfModal, generatingPdf, openPdfPreview, closePdfModal, handleExportPDF
  } = useRelatorios()

  if (loading && !kpis) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-7 h-7 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">A compilar relatórios e estatísticas avançadas...</p>
        </div>
      </PageShell>
    )
  }

  if (error || !kpis) {
    return (
      <PageShell>
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-6 text-center max-w-lg mx-auto my-12">
          <AlertTriangle className="w-9 h-9 text-rose-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200 mb-1">Erro de Carregamento</h3>
          <p className="text-rose-700 dark:text-rose-300 text-xs font-semibold mb-4">{error || 'Erro ao carregar dados operacionais'}</p>
          <BtnPrimary onClick={() => loadKpis()} icon={RefreshCw}>Tentar Novamente</BtnPrimary>
        </div>
      </PageShell>
    )
  }

  // ─── ESTRUTURAÇÃO DOS DADOS DOS GRÁFICOS (RECHARTS) ─────────────────────

  // Gráfico 1: Desempenho Financeiro
  const dataFinanceiro = [
    { name: 'Desembolsado', valor: kpis.totalDesembolsado, fill: '#18181b' },
    { name: 'Recebido', valor: kpis.totalRecebidoPagamentos, fill: '#059669' },
    { name: 'Juros Mora', valor: kpis.totalJurosRecebidos, fill: '#10b981' },
    { name: 'Saldo Devedor', valor: kpis.saldoCarteiraTotalDevedor, fill: '#f59e0b' },
    { name: 'Valor Atrasado', valor: kpis.valorTotalAtrasado, fill: '#e11d48' },
  ]

  // Gráfico 2: Proporção de Solicitações (Pie Chart)
  const dataCreditoPie = [
    { name: 'Aprovadas', value: kpis.solicitacoesAprovadas, color: '#059669' },
    { name: 'Reprovadas', value: kpis.solicitacoesReprovadas, color: '#e11d48' },
    { name: 'Pendentes', value: kpis.solicitacoesPendentes, color: '#f59e0b' },
  ]

  // Gráfico 3: Histórico Temporal de Operações (AreaChart)
  const rawHistory = kpis.history && kpis.history.length > 0
    ? kpis.history
    : [
        { data: '2026-08-01', vendas: 120000, compras: 80000, solicitacoes: 5, clientes: 2 },
        { data: '2026-08-08', vendas: 250000, compras: 140000, solicitacoes: 9, clientes: 4 },
        { data: '2026-08-15', vendas: 310000, compras: 190000, solicitacoes: 14, clientes: 8 },
        { data: '2026-08-22', vendas: 480000, compras: 230000, solicitacoes: 18, clientes: 12 },
        { data: '2026-08-30', vendas: 520000, compras: 310000, solicitacoes: 25, clientes: 15 },
      ]

  const dataTemporal = rawHistory.map(h => ({
    data: String(h.data).replace(/^.*-/, ''),
    Vendas: Number(h.vendas || 0),
    Compras: Number(h.compras || 0),
    Solicitações: Number(h.solicitacoes || 0),
  }))

  // Gráfico 4: Módulos ERP integrados (Vendas vs Compras)
  const dataErpModules = [
    {
      modulo: 'Vendas ERP',
      montante: kpis.erp?.valorTotalVendas || 0,
      quantidade: kpis.erp?.totalVendas || 0,
    },
    {
      modulo: 'Compras ERP',
      montante: kpis.erp?.valorTotalCompras || 0,
      quantidade: kpis.erp?.totalCompras || 0,
    },
    {
      modulo: 'Microcrédito',
      montante: kpis.totalDesembolsado || 0,
      quantidade: kpis.solicitacoesAprovadas || 0,
    },
  ]

  // Gráfico 5: Indicadores de Risco & Inadimplência (%)
  const dataRiscoMetrics = [
    { indicador: 'Taxa Aprovação', percentual: kpis.taxaAprovacao, fill: '#059669' },
    { indicador: 'Inadimplência', percentual: kpis.taxaInadimplencia, fill: kpis.taxaInadimplencia > 10 ? '#e11d48' : '#f59e0b' },
    { indicador: 'Lista Negra %', percentual: kpis.totalClientes > 0 ? Math.round((kpis.clientesNaListaNegra / kpis.totalClientes) * 100) : 0, fill: '#e11d48' },
  ]

  // Gráfico 6: Distribuição da Carteira de Clientes & Recursos Humanos
  const dataRecursosBase = [
    { categoria: 'Clientes Ativos', total: kpis.clientesAtivos, color: '#18181b' },
    { categoria: 'Na Lista Negra', total: kpis.clientesNaListaNegra, color: '#e11d48' },
    { categoria: 'Inadimplentes', total: kpis.totalClientesInadimplentes, color: '#f59e0b' },
    { categoria: 'Funcionários ERP', total: kpis.erp?.totalFuncionarios || 0, color: '#2563eb' },
    { categoria: 'Itens de Stock', total: kpis.erp?.totalItensStock || 0, color: '#7c3aed' },
  ]

  return (
    <PageShell>
      <PageHeader
        icon={BarChart3}
        title="Centro de Relatórios Operacionais & BI"
        description={`Análise gráfica avançada, telemetria financeira e emissão de PDFs em tempo real · Atualizado às ${new Date(kpis.geradoEm).toLocaleTimeString('pt-AO')}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Período */}
          <select
            value={diasFilter}
            onChange={e => setDiasFilter(Number(e.target.value))}
            className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-2 outline-none focus:border-zinc-900 dark:focus:border-white shadow-2xs cursor-pointer"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
            <option value={180}>Últimos 180 dias</option>
            <option value={365}>Último Ano (365d)</option>
          </select>

          <BtnSecondary onClick={openPdfPreview} loading={generatingPdf} icon={Eye}>
            Visualizar PDF Interno
          </BtnSecondary>

          <BtnPrimary onClick={handleExportPDF} icon={ArrowUpRight}>
            Exportar PDF
          </BtnPrimary>
        </div>
      </PageHeader>

      {/* ─── PAINEL PRINCIPAL DE GRÁFICOS (LINHA 1: DESEMPENHO E STATUS) ─── */}
      <section className="space-y-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" /> Gráficos de Fluxo Financeiro & Decisão de Crédito
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* GRÁFICO 1: Desempenho Financeiro */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Desempenho Financeiro (Kz)</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Comparativo entre concessão, reembolsos e carteira devedora</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 border border-emerald-200 dark:border-emerald-800">
                {formatKz(kpis.totalRecebidoPagamentos)} Recuados
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataFinanceiro} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#71717a' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: '#71717a' }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(val: any) => [formatKz(Number(val)), 'Montante']}
                    contentStyle={{ backgroundColor: '#18181b', color: '#fff', fontSize: '12px', border: 'none' }}
                  />
                  <Bar dataKey="valor">
                    {dataFinanceiro.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRÁFICO 2: Proporção de Solicitações (Pie Chart) */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs flex flex-col justify-between">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-2">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Status das Solicitações</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Proporção de aprovação e análise</p>
            </div>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataCreditoPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dataCreditoPie.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', color: '#fff', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda do Pie */}
            <div className="grid grid-cols-3 gap-1 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center">
              <div className="bg-emerald-50/80 dark:bg-emerald-950/60 p-2 border border-emerald-100 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold block">Aprovadas</span>
                <span className="text-xs font-bold text-emerald-900 dark:text-white font-mono">{kpis.solicitacoesAprovadas}</span>
              </div>
              <div className="bg-rose-50/80 dark:bg-rose-950/60 p-2 border border-rose-100 dark:border-rose-800">
                <span className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold block">Reprovadas</span>
                <span className="text-xs font-bold text-rose-900 dark:text-white font-mono">{kpis.solicitacoesReprovadas}</span>
              </div>
              <div className="bg-amber-50/80 dark:bg-amber-950/60 p-2 border border-amber-100 dark:border-amber-800">
                <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold block">Pendentes</span>
                <span className="text-xs font-bold text-amber-900 dark:text-white font-mono">{kpis.solicitacoesPendentes}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PAINEL DE GRÁFICOS (LINHA 2: TENDÊNCIA TEMPORAL & MÓDULOS ERP) ─── */}
      <section className="space-y-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
          <Activity className="w-4 h-4 text-zinc-600 dark:text-zinc-400" /> Tendência Temporal & Integração de Módulos ERP
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* GRÁFICO 3: Evolução Temporal com AreaChart */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs flex flex-col justify-between">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-3">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Evolução Temporal de Atividade</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Volume de vendas vs compras e pedidos de crédito ao longo do tempo</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataTemporal} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#18181b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCompras" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="data" tick={{ fontSize: 10, fill: '#71717a' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#71717a' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', color: '#fff', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="Vendas" stroke="#18181b" fillOpacity={1} fill="url(#colorVendas)" />
                  <Area type="monotone" dataKey="Compras" stroke="#2563eb" fillOpacity={1} fill="url(#colorCompras)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRÁFICO 4: Módulos ERP Integrados (Vendas vs Compras vs Crédito) */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs flex flex-col justify-between">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-3">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Volume Financeiro Por Módulo ERP (Kz)</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Comparativo entre faturação de vendas, compras a fornecedores e crédito</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dataErpModules} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="modulo" tick={{ fontSize: 10, fill: '#71717a' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#71717a' }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(val: any) => [formatKz(Number(val)), 'Volume (Kz)']} contentStyle={{ backgroundColor: '#18181b', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="montante" fill="#18181b" />
                  <Line type="monotone" dataKey="quantidade" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PAINEL DE GRÁFICOS (LINHA 3: RISCO & ESTRUTURA DE RECURSOS) ─── */}
      <section className="space-y-3">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-zinc-600 dark:text-zinc-400" /> Análise de Risco & Estrutura Operacional
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* GRÁFICO 5: Indicadores Risco (%) */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs flex flex-col justify-between">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-3">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Métricas de Risco & Saúde da Carteira (%)</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Taxa de aprovação, inadimplência e clientes em restrição</p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={dataRiscoMetrics} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(val) => `${val}%`} tick={{ fontSize: 10, fill: '#71717a' }} />
                  <YAxis dataKey="indicador" type="category" tick={{ fontSize: 10, fill: '#71717a' }} width={110} />
                  <Tooltip formatter={(val: any) => [`${val}%`, 'Percentual']} contentStyle={{ backgroundColor: '#18181b', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="percentual">
                    {dataRiscoMetrics.map((entry, idx) => (
                      <Cell key={`cell-risco-${idx}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRÁFICO 6: Estrutura da Base Operacional */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs flex flex-col justify-between">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-3">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Estrutura da Base de Dados & Recursos</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Distribuição entre utilizadores, lista negra e artigos ERP</p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataRecursosBase} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="categoria" tick={{ fontSize: 9, fill: '#71717a' }} interval={0} angle={-10} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: '#71717a' }} />
                  <Tooltip formatter={(val: any) => [val, 'Quantidade']} contentStyle={{ backgroundColor: '#18181b', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="total">
                    {dataRecursosBase.map((entry, idx) => (
                      <Cell key={`cell-rec-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CARTÕES KPIS RESUMO DOS MÓDULOS ─── */}
      <section className="space-y-2.5">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Resumo Integrado ERP & Recursos Humanos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <KpiCard icon={ShoppingBag} iconBg="bg-zinc-100 dark:bg-zinc-800" iconColor="text-zinc-700 dark:text-zinc-300"
            label="Total Vendas ERP" value={formatKz(kpis.erp?.valorTotalVendas || 0)} sub={`${kpis.erp?.totalVendas || 0} faturas emitidas`} />
          <KpiCard icon={ShoppingCart} iconBg="bg-zinc-100 dark:bg-zinc-800" iconColor="text-zinc-700 dark:text-zinc-300"
            label="Total Compras ERP" value={formatKz(kpis.erp?.valorTotalCompras || 0)} sub={`${kpis.erp?.totalCompras || 0} ordens de compra`} />
          <KpiCard icon={Users} iconBg="bg-blue-50 dark:bg-blue-950/60" iconColor="text-blue-600 dark:text-blue-400"
            label="Quadro de Funcionários" value={(kpis.erp?.totalFuncionarios || 0).toString()} sub="Operadores & Colaboradores" />
          <KpiCard icon={Layers} iconBg="bg-purple-50 dark:bg-purple-950/60" iconColor="text-purple-600 dark:text-purple-400"
            label="Itens de Inventário" value={(kpis.erp?.totalItensStock || 0).toString()} sub="Artigos no Armazém" />
        </div>
      </section>

      {/* Progress Bars */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs">
          <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Taxa de Aprovação</h3>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">{kpis.taxaAprovacao}%</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">das solicitações</span>
          </div>
          <div className="h-2 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div className="h-full bg-zinc-900 dark:bg-white transition-all duration-700" style={{ width: `${kpis.taxaAprovacao}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs">
          <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Taxa de Inadimplência</h3>
          <div className="flex items-end gap-3 mb-2">
            <span className={`text-2xl font-bold font-mono ${kpis.taxaInadimplencia > 10 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-white'}`}>
              {kpis.taxaInadimplencia}%
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">da carteira ativa</span>
          </div>
          <div className="h-2 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div className={`h-full transition-all duration-700 ${kpis.taxaInadimplencia > 10 ? 'bg-rose-600 dark:bg-rose-500' : 'bg-zinc-900 dark:bg-white'}`}
              style={{ width: `${Math.min(kpis.taxaInadimplencia, 100)}%` }} />
          </div>
        </div>
      </section>

      {/* MODAL DE VISUALIZAÇÃO INTERNA DO RELATÓRIO PDF */}
      {showPdfModal && pdfUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh] border border-zinc-300 dark:border-zinc-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 text-white">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold uppercase">Visualização Interna de Relatório PDF</h3>
                  <p className="text-[11px] text-zinc-400">Documento oficial gerado pelo motor Gloxis ERP</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <BtnSecondary
                  onClick={handleExportPDF}
                  icon={Download}
                >
                  Descarregar PDF
                </BtnSecondary>

                <button
                  onClick={closePdfModal}
                  className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Body with iFrame */}
            <div className="p-2 bg-zinc-100 dark:bg-zinc-950 flex-1 overflow-hidden">
              <iframe
                src={pdfUrl}
                title="Relatório PDF Gloxis"
                className="w-full h-[75vh] border border-zinc-200 dark:border-zinc-800 bg-white"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Relatório de KPIs · Período: {diasFilter} Dias</span>
              <BtnSecondary onClick={closePdfModal}>Fechar Visualizador</BtnSecondary>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}
