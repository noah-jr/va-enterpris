import { Receipt, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useContabilidade } from '../hooks/useContabilidade'
import type { Fatura } from '../hooks/useContabilidade'

function formatKz(v: number) {
  return `${Number(v || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz`
}

const STATUS: Record<string, { label: string; badge: string }> = {
  PAGO:       { label: 'Pago', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
  PENDENTE:   { label: 'Pendente', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
  VENCIDO:    { label: 'Vencido', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
  CANCELADO:  { label: 'Cancelado', badge: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
}

export function Contabilidade() {
  const {
    faturas,
    loading,
    error,
    totalPago,
    totalPendente,
    totalVencido,
    downloadPdf,
  } = useContabilidade()

  if (loading) return (
    <div className="flex justify-center p-16">
      <div className="spinner spinner-lg" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Faturação & Contabilidade</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Histórico fiscal e estado dos seus documentos de cobrança.</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 font-semibold">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Pago', value: totalPago, icon: CheckCircle, cls: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900' },
          { label: 'Pendente', value: totalPendente, icon: Clock, cls: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900' },
          { label: 'Vencido', value: totalVencido, icon: AlertCircle, cls: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900' },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className={`p-4 border ${cls} space-y-2`}>
            <div className="flex justify-between items-center">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</p>
              <Icon size={18} />
            </div>
            <p className="text-lg font-extrabold font-mono tracking-tight">{formatKz(value)}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
          <Receipt size={18} className="text-zinc-900 dark:text-white" />
          <span className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-white">Documentos Fiscais</span>
          <span className="ml-auto text-[11px] text-zinc-400 font-mono font-semibold">{faturas.length} documento{faturas.length !== 1 ? 's' : ''}</span>
        </div>

        {faturas.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
              <Receipt size={24} />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Sem documentos fiscais</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">As suas faturas emitidas aparecerão aqui.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Nº Documento</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Emissão</th>
                  <th className="p-3">Vencimento</th>
                  <th className="p-3">Valor</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acção</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {faturas.map((f: Fatura) => {
                  const st = STATUS[f.status] || { label: f.status, badge: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' }
                  const isVencido = f.status === 'VENCIDO'
                  return (
                    <tr key={f.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-zinc-900 dark:text-white">
                        #{String(f.id).padStart(5, '0')}
                      </td>
                      <td className="p-3 text-zinc-600 dark:text-zinc-400 font-semibold uppercase text-[11px]">
                        {f.tipoDocumento || 'FATURA'}
                      </td>
                      <td className="p-3 text-zinc-500 dark:text-zinc-400">
                        {f.created_at ? new Date(f.created_at).toLocaleDateString('pt-PT') : '—'}
                      </td>
                      <td className={`p-3 font-medium ${isVencido ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        {f.dataVencimento ? new Date(f.dataVencimento).toLocaleDateString('pt-PT') : '—'}
                      </td>
                      <td className="p-3">
                        <span className="font-bold font-mono text-zinc-900 dark:text-white">{formatKz(Number(f.valor || 0))}</span>
                        {Number(f.valorImposto) > 0 && (
                          <span className="text-[10px] text-zinc-400 block font-mono">IVA: {formatKz(Number(f.valorImposto || 0))}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${st.badge}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button 
                          className="inline-flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-3 py-1 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all" 
                          onClick={() => downloadPdf(f.id)}
                        >
                          <Download size={12} /> PDF
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
