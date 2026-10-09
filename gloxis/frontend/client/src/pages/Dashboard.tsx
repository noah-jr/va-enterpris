import { Link } from 'react-router'
import {
  TrendingUp, CreditCard, CheckCircle, AlertCircle,
  ArrowRight, FileText, Calculator, Receipt, HeadphonesIcon, ChevronRight
} from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'
import type { PagamentoInfo } from '../hooks/useDashboard'

function formatKz(v: number) {
  return `${Number(v || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz`
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
}

const QUICK_ACTIONS = [
  { to: '/solicitar', label: 'Solicitar Crédito', desc: 'Nova solicitação', icon: FileText },
  { to: '/simular', label: 'Simulador', desc: 'Calcule prestações', icon: Calculator },
  { to: '/contabilidade', label: 'Faturação', desc: 'Ver faturas', icon: Receipt },
  { to: '/consultoria', label: 'Consultoria', desc: 'Agendar reunião', icon: HeadphonesIcon },
]

export function Dashboard() {
  const { data, loading, error } = useDashboard()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-7 h-7 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const saldo = data?.saldoDevedor || 0
  const parcela = data?.proximaParcela
  const pagamentos = data?.ultimosPagamentos || []
  const classificacao = data?.classificacao

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Cards Grid matching Reference Image */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Painel de Controlo & Crédito</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Gerencie a sua carteira e saldos ativos</p>
          </div>
          <Link to="/simular" className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-2xs transition-colors">
            + Novo Financiamento
          </Link>
        </div>

        {/* Twin Sleek Credit Cards matching Reference UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Slate Dark */}
          <div className="bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 p-6 relative overflow-hidden shadow-md flex flex-col justify-between h-52 text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Saldo Devedor Total</p>
                <p className="text-xs text-zinc-500 mt-0.5 font-mono">Conta Corrente nº ....2502</p>
              </div>
              <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center text-zinc-200">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>

            <div>
              <p className="text-3xl font-bold text-white font-mono tracking-tight">{formatKz(saldo)}</p>
              <div className="flex items-center justify-between mt-4 text-[11px] text-zinc-400 font-medium">
                <span>Gloxis Financials</span>
                <span className="font-mono font-bold uppercase">Mastercard</span>
              </div>
            </div>
          </div>

          {/* Card 2: Neutral High Contrast */}
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 p-6 relative overflow-hidden shadow-2xs flex flex-col justify-between h-52 text-zinc-900 dark:text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Próxima Amortização</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono">Reserva nº ....3458</p>
              </div>
              <div className="w-8 h-8 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-800 dark:text-zinc-200">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div>
              {parcela ? (
                <>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-white font-mono tracking-tight">{formatKz(parcela.valor)}</p>
                  <div className="flex items-center justify-between mt-4 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    <span>Vencimento: {formatDate(parcela.vencimento)}</span>
                    <span className="font-mono font-bold uppercase">Parcela #{parcela.numeroParcela}</span>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Sem Parcelas Pendentes</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">A sua conta encontra-se em dia.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500" /> {error}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">Ações Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(action => (
            <Link
              key={action.to}
              to={action.to}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 shadow-2xs hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-9 h-9 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-900 transition-colors">
                <action.icon className="w-4 h-4 text-zinc-800 dark:text-zinc-200 group-hover:text-white dark:group-hover:text-zinc-900 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{action.label}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{action.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Payments Table matching Reference Image */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Pagamentos Recentes</h3>
          <Link to="/creditos" className="text-xs font-semibold text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center gap-1">
            Ver Todos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pagamentos.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 text-center text-zinc-400 dark:text-zinc-500 shadow-2xs">
            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">Sem pagamentos recentes</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {pagamentos.map((p: PagamentoInfo, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                        Amortização Parcela {p.numeroParcela}/{p.totalParcelas}
                      </p>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{formatDate(p.dataPagamento)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">{formatKz(p.valorPago)}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold">
                      Concluído
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Credit Score Banner */}
      {classificacao && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">Score & Fidelidade Corporativa</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Nível <strong className="text-zinc-900 dark:text-white">{classificacao.nivel}</strong> · {classificacao.pontosFidelidade} pontos acumulados
              </p>
            </div>
          </div>
          <Link to="/creditos" className="border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors">
            Ver Detalhes
          </Link>
        </div>
      )}
    </div>
  )
}
