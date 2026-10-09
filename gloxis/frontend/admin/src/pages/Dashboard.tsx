import React from 'react'
import {
  PageShell, PageHeader, StatusBadge, BtnPrimary, KzValue
} from '../components/ui'
import {
  TrendingUp, Users, AlertTriangle, Wallet,
  CheckCircle, XCircle, Clock, BarChart3, ArrowUpRight,
  MoreHorizontal, Download, LayoutDashboard
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useDashboard, type KPIHistoryItem } from '../hooks/useDashboard'

function ChartStatCard({ title, value, sub, icon: Icon, color, trend, chartType = 'line', historyKey, historyData }: {
  title: string
  value: string
  sub?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  trend?: string
  chartType?: 'line' | 'bar' | 'area'
  historyKey?: string
  historyData?: KPIHistoryItem[]
}) {
  let data: Array<{ name: string; val: number }> = []
  if (historyData && historyKey && historyData.length > 0) {
    data = historyData.map(item => ({
      name: item.data,
      val: (item[historyKey] as number) || 0
    }))
  } else {
    data = [{ name: 'Sem Dados', val: 0 }]
  }

  let hexColor = '#18181b'
  if (color.includes('red') || color.includes('rose')) hexColor = '#e11d48'
  else if (color.includes('green') || color.includes('emerald')) hexColor = '#059669'
  else if (color.includes('orange') || color.includes('amber')) hexColor = '#d97706'
  else if (color.includes('blue')) hexColor = '#2563eb'

  return (
    <div className="p-4 relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between h-44">
      <div className="relative z-10 flex justify-between items-start mb-2">
        <div>
          <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">{title}</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-white mt-1 font-mono tracking-tight">{value}</p>
        </div>
        <div className="w-9 h-9 flex shrink-0 items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>

      <div className="relative z-10 h-12 w-full mt-auto mb-1.5 opacity-85 hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data}>
              <Line type="monotone" dataKey="val" stroke={hexColor} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          ) : chartType === 'bar' ? (
            <BarChart data={data}>
              <Bar dataKey="val" fill={hexColor} isAnimationActive={false} />
            </BarChart>
          ) : (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`colorUv-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={hexColor} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={hexColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="val" stroke={hexColor} fillOpacity={1} fill={`url(#colorUv-${title.replace(/\s+/g, '')})`} strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {sub && (
        <div className="relative z-10 flex items-center justify-between mt-auto pt-1.5 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 truncate">{sub}</p>
          {trend && (
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> {trend}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function formatKz(val: number) {
  return `Kz ${Number(val || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function Dashboard() {
  const {
    kpis, loading, error, recentes, vendas, diasFiltro, setDiasFiltro, handleExportPDF, mainChartData
  } = useDashboard()

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-7 h-7 border-2 border-zinc-900 dark:border-white border-t-transparent animate-spin" />
        </div>
      </PageShell>
    )
  }

  if (error || !kpis) {
    return (
      <PageShell>
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-rose-700 dark:text-rose-300 font-semibold text-xs">{error || 'Erro ao carregar dados'}</p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        icon={LayoutDashboard}
        title="Painel de Controlo"
        description="Centro de comando financeiro, inteligência operacional e métricas de desempenho."
      >
        <select
          value={diasFiltro}
          onChange={(e) => setDiasFiltro(Number(e.target.value))}
          className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-white cursor-pointer shadow-2xs"
        >
          <option value={7}>Últimos 7 dias</option>
          <option value={15}>Últimos 15 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={90}>Últimos 90 dias</option>
          <option value={365}>Este Ano</option>
        </select>
        <BtnPrimary onClick={handleExportPDF} icon={Download}>
          Exportar Relatório
        </BtnPrimary>
      </PageHeader>

      {/* Clientes */}
      <section className="space-y-2.5">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Clientes & Mutuários</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <ChartStatCard title="Total de Clientes" value={kpis.totalClientes.toString()} sub={`${kpis.clientesAtivos} ativos`}
            icon={Users} color="blue" chartType="area" historyData={kpis.history} historyKey="clientes" />
          <ChartStatCard title="Na Lista Negra" value={kpis.clientesNaListaNegra.toString()} sub="Bloqueados para novos créditos"
            icon={AlertTriangle} color="red" chartType="line" historyData={kpis.history} historyKey="clientes" />
          <ChartStatCard title="Inadimplentes" value={kpis.totalClientesInadimplentes.toString()} sub={`${kpis.taxaInadimplencia}% da carteira`}
            icon={XCircle} color="orange" chartType="bar" historyData={kpis.history} historyKey="clientes" />
        </div>
      </section>

      {/* Pipeline de Crédito */}
      <section className="space-y-2.5">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Pipeline de Crédito</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <ChartStatCard title="Total de Solicitações" value={kpis.solicitacoesTotal.toString()}
            icon={BarChart3} color="zinc" chartType="bar" historyData={kpis.history} historyKey="solicitacoes" />
          <ChartStatCard title="Aprovadas" value={kpis.solicitacoesAprovadas.toString()} sub={`Taxa: ${kpis.taxaAprovacao}%`}
            icon={CheckCircle} color="green" chartType="area" historyData={kpis.history} historyKey="solicitacoes" />
          <ChartStatCard title="Reprovadas" value={kpis.solicitacoesReprovadas.toString()}
            icon={XCircle} color="red" chartType="line" historyData={kpis.history} historyKey="solicitacoes" />
          <ChartStatCard title="Pendentes" value={kpis.solicitacoesPendentes.toString()} sub="Aguardam análise"
            icon={Clock} color="orange" chartType="bar" historyData={kpis.history} historyKey="solicitacoes" />
        </div>
      </section>

      {/* Desempenho Financeiro */}
      <section className="space-y-2.5">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Financeiro & Carteira</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3.5">
          <ChartStatCard title="Total Desembolsado" value={formatKz(kpis.totalDesembolsado)} icon={Wallet} color="zinc" chartType="area" />
          <ChartStatCard title="Total Recebido" value={formatKz(kpis.totalRecebidoPagamentos)} icon={TrendingUp} color="green" chartType="bar" historyData={kpis.history} historyKey="vendas" />
          <ChartStatCard title="Juros Recebidos" value={formatKz(kpis.totalJurosRecebidos)} sub="Receita por mora" icon={TrendingUp} color="green" chartType="line" />
          <ChartStatCard title="Carteira em Aberto" value={formatKz(kpis.saldoCarteiraTotalDevedor)} sub={`Em atraso: ${formatKz(kpis.valorTotalAtrasado)}`} icon={AlertTriangle} color="red" chartType="area" />
        </div>
      </section>

      {/* Progress Bars */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">Taxa de Aprovação</h3>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">{kpis.taxaAprovacao}%</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">das solicitações</span>
          </div>
          <div className="h-2 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div className="h-full bg-zinc-900 dark:bg-white transition-all duration-700" style={{ width: `${kpis.taxaAprovacao}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">Taxa de Inadimplência</h3>
          <div className="flex items-end gap-3 mb-2">
            <span className={`text-2xl font-bold font-mono ${kpis.taxaInadimplencia > 10 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-white'}`}>
              {kpis.taxaInadimplencia}%
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">da carteira ativa</span>
          </div>
          <div className="h-2 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div className={`h-full transition-all duration-700 ${kpis.taxaInadimplencia > 10 ? 'bg-rose-600 dark:bg-rose-500' : 'bg-zinc-900 dark:bg-white'}`} style={{ width: `${Math.min(kpis.taxaInadimplencia, 100)}%` }} />
          </div>
        </div>
      </section>

      {/* Análise Gráfica Global */}
      <section className="space-y-2.5">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Análise Financeira Global</h2>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Evolução de Receitas vs Despesas</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Comparativo dos últimos 6 meses de operações ERP</p>
            </div>
            <BtnPrimary onClick={handleExportPDF} icon={Download}>
              Relatório Detalhado
            </BtnPrimary>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mainChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71717a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis dataKey="mes" stroke="#a1a1aa" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#a1a1aa" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => `Kz ${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }}
                  itemStyle={{ color: '#ffffff' }}
                  formatter={(value: number) => [`Kz ${value.toLocaleString('pt-AO')}`, undefined]}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" name="Receitas Brutas" dataKey="receitas" stroke="#18181b" strokeWidth={2} fillOpacity={1} fill="url(#colorReceitas)" />
                <Area type="monotone" name="Despesas Totais" dataKey="despesas" stroke="#71717a" strokeWidth={2} fillOpacity={1} fill="url(#colorDespesas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Pre-lists / Tables */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col shadow-2xs">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Últimas Solicitações de Crédito</h3>
            <button className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"><MoreHorizontal className="w-4 h-4" /></button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                  <th className="py-2.5 px-4 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase">ID</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase">Valor</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                {recentes.length > 0 ? recentes.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-semibold text-zinc-900 dark:text-white">#{item.id}</td>
                    <td className="py-2.5 px-4 font-mono"><KzValue value={item.valor} /></td>
                    <td className="py-2.5 px-4"><StatusBadge status={item.status} /></td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="py-8 text-center text-zinc-400">Nenhum registo recente</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col shadow-2xs">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Vendas Recentes (POS/ERP)</h3>
            <button className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"><MoreHorizontal className="w-4 h-4" /></button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                  <th className="py-2.5 px-4 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase">Fatura</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase">Valor</th>
                  <th className="py-2.5 px-4 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                {vendas.length > 0 ? vendas.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-semibold text-zinc-900 dark:text-white">FT-{2024000 + item.id}</td>
                    <td className="py-2.5 px-4 font-mono"><KzValue value={item.valor} /></td>
                    <td className="py-2.5 px-4"><StatusBadge status={item.status || 'PENDENTE'} /></td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="py-8 text-center text-zinc-400">Nenhum registo recente</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
