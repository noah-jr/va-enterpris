import { useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api/client'
import { useFileUrl } from '../hooks/useFileUrl'
import { AttachmentLink } from '../components/AttachmentLink'
import { PdfViewerModal } from '../components/PdfViewerModal'
import {
  Clock, CheckCircle, CreditCard, FileText,
  ChevronDown, ChevronUp, Upload, AlertTriangle, Download,
  CalendarClock, Banknote, Send
} from 'lucide-react'
import { useMeusCreditos, useCreditoTimeline } from '../hooks/useMeusCreditos'
import type { CreditoItem, ParcelaData } from '../hooks/useMeusCreditos'

function formatKz(v: number) {
  return `${Number(v || 0).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz`
}

function daysLabel(days: number | null) {
  if (days === null) return '—'
  if (days < 0) return `${Math.abs(days)} dias em atraso`
  if (days === 0) return 'Vence hoje!'
  return `${days} dias restantes`
}

const STATUS_MAP: Record<string, { label: string; badge: string }> = {
  PENDENTE:     { label: 'Em Análise',    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
  APROVADO:     { label: 'Aprovado',      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
  REJEITADO:    { label: 'Recusado',      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
  DESEMBOLSADO: { label: 'Desembolsado', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
  PROCESSADO:   { label: 'Pago',         badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
  ATRASADO:     { label: 'Atrasado',     badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
}

// ─── Parcela Card ────────────────────────────────────────────────────────────
function ParcelaRow({ p, onRefresh }: { p: ParcelaData; onRefresh: () => void }) {
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [notas, setNotas] = useState('')
  const st = STATUS_MAP[p.status] || { label: p.status, badge: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' }

  const handleReembolso = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('comprovativo', file)
    fd.append('pagamentoId', String(p.id))
    fd.append('metodo', 'TRANSFERENCIA')
    fd.append('notas', notas)
    try {
      await api.post('/operacoes/reembolsos', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      alert('✅ Comprovativo enviado! O gestor irá validar em breve.')
      onRefresh()
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } }; message?: string }
      alert('Erro ao enviar: ' + (errObj.response?.data?.error || errObj.message))
    } finally {
      setUploading(false)
      setShowUpload(false)
    }
  }

  return (
    <div className={`flex flex-col gap-2 p-3.5 border transition-all ${
      p.atrasada 
        ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900' 
        : p.status === 'PROCESSADO' 
        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900' 
        : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/80'
    }`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 flex items-center justify-center font-bold text-xs ${st.badge}`}>
            {p.status === 'PROCESSADO' ? <CheckCircle size={15} /> : p.atrasada ? <AlertTriangle size={14} /> : p.numeroParcela}
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-900 dark:text-white">
              Parcela {p.numeroParcela} — {formatKz(p.valorParcela)}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Vencimento: {p.dataVencimento ? new Date(p.dataVencimento).toLocaleDateString('pt-PT') : '—'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold px-2.5 py-0.5 bg-zinc-200/70 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            {daysLabel(p.diasRestantes)}
          </span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 uppercase tracking-wider ${st.badge}`}>
            {st.label}
          </span>
        </div>
      </div>

      {p.comprativoReembolsoPath && (
        <div className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 mt-1 font-medium">
          <AttachmentLink
            path={p.comprativoReembolsoPath}
            label="Ver comprovativo enviado"
            style={{ color: 'inherit', textDecoration: 'underline' }}
            icon={<FileText size={13} />}
          />
          {p.status === 'PENDENTE' && <span className="text-amber-600 dark:text-amber-400 ml-2 font-bold">⏳ Aguarda validação</span>}
        </div>
      )}

      {p.faturaParcelaId && (
        <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 mt-1">
          <Download size={13} />
          <a href={api.getApiUrl(`/faturacao/${p.faturaParcelaId}/pdf`)} target="_blank" rel="noreferrer" className="underline font-semibold">
            Descarregar Fatura da Parcela
          </a>
        </div>
      )}

      {(p.status === 'PENDENTE' || p.status === 'ATRASADO') && !p.comprativoReembolsoPath && (
        <div className="mt-1">
          {showUpload ? (
            <div className="flex flex-col gap-2">
              <textarea
                placeholder="Notas opcionais (referência de transferência, banco, etc.)"
                value={notas}
                onChange={e => setNotas(e.target.value)}
                rows={2}
                className="w-full text-xs p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none"
              />
              <div className="flex gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 uppercase tracking-wider">
                  {uploading ? <><div className="spinner w-3 h-3" /> A enviar...</> : <><Upload size={13} /> Anexar Comprovativo</>}
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleReembolso} disabled={uploading} />
                </label>
                <button onClick={() => setShowUpload(false)} className="px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold cursor-pointer">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowUpload(true)} className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider cursor-pointer border ${
              p.atrasada
                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
                : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent'
            }`}>
              <Send size={12} />
              {p.atrasada ? 'Enviar Reembolso Urgente' : 'Enviar Comprovativo'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Credito Card ─────────────────────────────────────────────────────────────
function CreditoCard({ c }: { c: CreditoItem }) {
  const { getFileUrl, getApiUrl } = useFileUrl()
  const [expanded, setExpanded] = useState(false)
  const { timeline, loadingTimeline, loadTimeline } = useCreditoTimeline(c.id, expanded)
  const [pdfModal, setPdfModal] = useState<{ isOpen: boolean; title: string; pdfUrl: string }>({
    isOpen: false,
    title: '',
    pdfUrl: ''
  })
  const st = STATUS_MAP[c.status] || { label: c.status, badge: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' }

  const progressoParcelas = timeline
    ? Math.round((timeline.resumo.parcelasPagas / Math.max(timeline.resumo.totalParcelas, 1)) * 100)
    : 0

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xs">
      {/* Header */}
      <div
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer gap-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 shrink-0">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono uppercase tracking-wider font-semibold">Solicitação #{c.id}</p>
            <p className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight">{formatKz(c.valor)}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{c.parcelas} parcelas — {c.finalidade || 'Microcrédito'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1 uppercase tracking-wider ${st.badge}`}>
            {st.label}
          </span>
          {expanded ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-zinc-100 dark:border-zinc-800">
          {loadingTimeline ? (
            <div className="flex justify-center p-8">
              <div className="spinner" />
            </div>
          ) : timeline ? (
            <div className="p-4 sm:p-5 space-y-5">

              {/* Timeline Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 border border-zinc-200/80 dark:border-zinc-700/80 text-center">
                  <CalendarClock size={16} className="mx-auto mb-1 text-zinc-500 dark:text-zinc-400" />
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Início</p>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white mt-0.5">
                    {timeline.solicitacao.dataInicioPagamento
                      ? new Date(timeline.solicitacao.dataInicioPagamento).toLocaleDateString('pt-PT')
                      : 'Aguarda desembolso'}
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 border border-zinc-200/80 dark:border-zinc-700/80 text-center">
                  <Clock size={16} className="mx-auto mb-1 text-zinc-500 dark:text-zinc-400" />
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Prazo Final</p>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white mt-0.5">
                    {timeline.solicitacao.dataVencimentoFinal
                      ? new Date(timeline.solicitacao.dataVencimentoFinal).toLocaleDateString('pt-PT')
                      : '—'}
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 border border-zinc-200/80 dark:border-zinc-700/80 text-center">
                  <Banknote size={16} className="mx-auto mb-1 text-zinc-500 dark:text-zinc-400" />
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Tempo Restante</p>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white mt-0.5">
                    {daysLabel(timeline.solicitacao.diasParaFim)}
                  </p>
                </div>
              </div>

              {/* Progresso de parcelas */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span>Parcelas pagas: {timeline.resumo.parcelasPagas}/{timeline.resumo.totalParcelas}</span>
                  <span className="text-zinc-900 dark:text-white">{progressoParcelas}%</span>
                </div>
                <div className="h-2 bg-zinc-200 dark:bg-zinc-700 w-full overflow-hidden">
                  <div className="h-full bg-zinc-900 dark:bg-white transition-all duration-500" style={{ width: `${progressoParcelas}%` }} />
                </div>
                <div className="flex justify-between text-[11px] font-semibold pt-1">
                  <span className="text-emerald-600 dark:text-emerald-400">Pago: {formatKz(timeline.resumo.totalPago)}</span>
                  <span className="text-rose-600 dark:text-rose-400">Em aberto: {formatKz(timeline.resumo.totalEmAberto)}</span>
                </div>
              </div>

              {/* Comprovativo de desembolso */}
              {(timeline.solicitacao.comprovativoDesembolsoPath || timeline.solicitacao.faturaDesembolsoId || timeline.solicitacao.faturaSolicitacaoId) && (
                <div className="flex items-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs flex-wrap">
                  <CheckCircle size={14} className="text-zinc-900 dark:text-white" />
                  <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[11px]">Documentos:</span>

                  <button
                    type="button"
                    onClick={() => setPdfModal({
                      isOpen: true,
                      title: `Contrato de Mútuo — Solicitação #${timeline.solicitacao.id}`,
                      pdfUrl: getApiUrl(`/solicitacoes/${timeline.solicitacao.id}/contrato/pdf`)
                    })}
                    className="inline-flex items-center gap-1 font-bold underline text-zinc-900 dark:text-white cursor-pointer mr-2"
                  >
                    <FileText size={13} /> Contrato (PDF)
                  </button>

                  {timeline.solicitacao.comprovativoDesembolsoPath && (
                    <button
                      type="button"
                      onClick={() => setPdfModal({
                        isOpen: true,
                        title: `Comprovativo de Transferência Bancária — Solicitação #${timeline.solicitacao.id}`,
                        pdfUrl: getFileUrl(timeline.solicitacao.comprovativoDesembolsoPath!)
                      })}
                      className="inline-flex items-center gap-1 font-bold underline text-zinc-900 dark:text-white cursor-pointer mr-2"
                    >
                      <Download size={13} /> Comprovativo Transferência
                    </button>
                  )}

                  {timeline.solicitacao.faturaDesembolsoId && (
                    <button
                      type="button"
                      onClick={() => setPdfModal({
                        isOpen: true,
                        title: `Recibo de Desembolso — Fatura #${timeline.solicitacao.faturaDesembolsoId}`,
                        pdfUrl: getApiUrl(`/faturacao/${timeline.solicitacao.faturaDesembolsoId}/pdf`)
                      })}
                      className="inline-flex items-center gap-1 font-bold underline text-zinc-900 dark:text-white cursor-pointer"
                    >
                      <Download size={13} /> Recibo Desembolso
                    </button>
                  )}
                </div>
              )}

              {/* Lista de parcelas */}
              {timeline.parcelas.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Calendário de Reembolso
                  </p>
                  {timeline.parcelas.map((p: ParcelaData) => (
                    <ParcelaRow key={p.id} p={p} onRefresh={loadTimeline} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-zinc-400 text-xs font-medium">
                  Aguarda desembolso para geração do calendário de parcelas.
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40">
              <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">Produto</p>
                  <p className="font-bold text-zinc-900 dark:text-white mt-1">{c.produto?.nome || 'Crédito Pessoal'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">Prazo</p>
                  <p className="font-bold text-zinc-900 dark:text-white mt-1">{c.parcelas} meses</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">Submetido</p>
                  <p className="font-bold text-zinc-900 dark:text-white mt-1">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-PT') : 'N/A'}
                  </p>
                </div>
              </div>
              {c.status === 'PENDENTE' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                  <Clock size={15} className="shrink-0" />
                  <span>A sua solicitação está em análise. O calendário de reembolso será gerado após o desembolso.</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <PdfViewerModal
        isOpen={pdfModal.isOpen}
        onClose={() => setPdfModal(prev => ({ ...prev, isOpen: false }))}
        title={pdfModal.title}
        pdfUrl={pdfModal.pdfUrl}
      />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function MeusCreditos() {
  const { creditos, loading, filter, setFilter, filtered } = useMeusCreditos()

  if (loading) return (
    <div className="flex justify-center p-16">
      <div className="spinner spinner-lg" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Meus Créditos</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Acompanhe o calendário de reembolso e envie os seus comprovativos.</p>
        </div>
        <Link to="/solicitar" className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs px-4 py-2 uppercase tracking-wider flex items-center gap-2 transition-all">
          <FileText size={15} /> Nova Solicitação
        </Link>
      </div>

      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        {['TODOS', 'PENDENTE', 'APROVADO', 'REJEITADO'].map(f => (
          <button 
            key={f} 
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
              filter === f 
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`} 
            onClick={() => setFilter(f)}
          >
            {f === 'TODOS' ? 'Todos' : STATUS_MAP[f]?.label || f}
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-zinc-200/60 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
              {f === 'TODOS' ? creditos.length : creditos.filter((c: CreditoItem) => c.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
            <CreditCard size={24} />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Sem solicitações registradas</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            {filter === 'TODOS' ? 'Ainda não tem solicitações ativas na sua conta.' : 'Não existem solicitações de crédito neste estado.'}
          </p>
          {filter === 'TODOS' && (
            <Link to="/solicitar" className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs px-4 py-2 uppercase tracking-wider mt-4">
              <FileText size={15} /> Solicitar Crédito
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c: CreditoItem) => <CreditoCard key={c.id} c={c} />)}
        </div>
      )}
    </div>
  )
}
