import {
  PageShell, PageHeader, KpiCard, DataTable, Table, StatusBadge,
  Toolbar, FilterSelect, BtnPrimary, BtnSecondary, Modal, ModalFooter,
  FormField, inputClass, KzValue, Toast, BtnRefresh, IconBtn
} from '../components/ui'
import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { AttachmentLink } from '../components/AttachmentLink'
import {
  CreditCard, CheckCircle, Clock, AlertTriangle, DollarSign,
  TrendingUp, Printer, Download, CheckCircle2, XCircle, FileText
} from 'lucide-react'
import { PaginationControl } from '../components/PaginationControl'

interface Pagamento {
  id: number
  solicitacaoId: number
  numeroParcela: number
  valorPago: number
  valorJurosMora: number
  valorMulta: number
  status: 'PENDENTE' | 'PROCESSADO' | 'REJEITADO' | 'ATRASADO'
  dataVencimento: string
  dataPagamento: string | null
  comprativoReembolsoPath?: string
  reciboPath?: string
  solicitacao?: {
    cliente?: { nome: string; nif: string }
  }
}

export function Pagamentos() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const [selectedForPayment, setSelectedForPayment] = useState<Pagamento | null>(null)
  const [valorRecebido, setValorRecebido] = useState<number>(0)
  const [jurosMoraManual, setJurosMoraManual] = useState<number>(0)
  const [multaManual, setMultaManual] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receiptPayment, setReceiptPayment] = useState<Pagamento | null>(null)
  const [validando, setValidando] = useState<number | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const load = () => {
    setLoading(true)
    api.get('/operacoes/pagamentos')
      .then(res => {
        const payload = res.data.data || res.data
        const arrayData = Array.isArray(payload) ? payload : (payload.data || [])
        setPagamentos(arrayData)
      })
      .catch(err => console.error("Failed to load pagamentos:", err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleValidation = async (id: number, acao: 'APROVAR' | 'REJEITAR') => {
    setValidando(id)
    try {
      if (acao === 'APROVAR') {
        await api.post(`/operacoes/pagamentos/${id}/liquidar`, { valorPago: 0 })
        showToast('Pagamento validado com sucesso!')
      } else {
        await api.put(`/operacoes/pagamentos/${id}/status`, { status: 'REJEITADO' })
        showToast('Pagamento marcado como rejeitado.', 'error')
      }
      load()
    } catch {
      showToast('Erro ao atualizar liquidação.', 'error')
    } finally {
      setValidando(null)
    }
  }

  const handleLiquidarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedForPayment) return
    setIsSubmitting(true)
    try {
      await api.post(`/operacoes/pagamentos/${selectedForPayment.id}/liquidar`, {
        valorPago: valorRecebido,
        valorJurosMora: jurosMoraManual,
        valorMulta: multaManual,
      })
      showToast('Reembolso amortizado e recibo emitido!')
      setSelectedForPayment(null)
      load()
    } catch {
      showToast('Erro ao processar quitação.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = pagamentos.filter(p => {
    const matchStatus = !filterStatus || p.status === filterStatus
    const clienteNome = p.solicitacao?.cliente?.nome || ''
    const matchSearch = !search ||
      clienteNome.toLowerCase().includes(search.toLowerCase()) ||
      p.solicitacaoId.toString().includes(search) ||
      p.id.toString().includes(search)
    return matchStatus && matchSearch
  })

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const totalRecebido = pagamentos.filter(p => p.status === 'PROCESSADO').reduce((acc, p) => acc + Number(p.valorPago || 0), 0)
  const totalPendente = pagamentos.filter(p => p.status === 'PENDENTE').reduce((acc, p) => acc + Number(p.valorPago || 0), 0)

  const totalComAcrescidos = valorRecebido + jurosMoraManual + multaManual

  return (
    <PageShell>
      {toast && <Toast message={toast.msg} type={toast.type} />}

      <PageHeader
        icon={CreditCard}
        title="Gestão de Pagamentos & Quitações"
        description="Controlo de reembolsos de parcelas, validação de comprovativos bancários e emissão de recibos."
      >
        <BtnRefresh onClick={load} loading={loading} />
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard icon={TrendingUp} iconBg="bg-emerald-50" iconColor="text-emerald-600"
          label="Total Liquidado" value={`Kz ${totalRecebido.toLocaleString('pt-AO')}`} sub="Reembolsos confirmados" />
        <KpiCard icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600"
          label="Em Cobrança" value={`Kz ${totalPendente.toLocaleString('pt-AO')}`} sub="Prestações vincendas" />
        <KpiCard icon={AlertTriangle} iconBg="bg-rose-50" iconColor="text-rose-600"
          label="Parcelas em Atraso" value={String(pagamentos.filter(p => p.status === 'ATRASADO').length)} sub="Requer ação de recuperação" />
        <KpiCard icon={DollarSign} iconBg="bg-zinc-100" iconColor="text-zinc-700"
          label="Total de Quitações" value={String(pagamentos.length)} sub="Histórico de transações" />
      </div>

      {/* Table */}
      <DataTable
        toolbar={
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Pesquisar por Cliente, Nº Pedido..."
          >
            <FilterSelect
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: 'PENDENTE', label: 'Pendentes' },
                { value: 'PROCESSADO', label: 'Liquidados / Confirmados' },
                { value: 'ATRASADO', label: 'Em Atraso / Mora' },
                { value: 'REJEITADO', label: 'Rejeitados' },
              ]}
              placeholder="Todos os Estados"
            />
          </Toolbar>
        }
        pagination={
          <PaginationControl
            currentPage={currentPage} totalPages={totalPages} totalItems={totalItems}
            perPage={perPage} onPageChange={setCurrentPage} onPerPageChange={p => { setPerPage(p); setCurrentPage(1) }}
          />
        }
      >
        <Table
          headers={['Nº Transação', 'Cliente / Pedido', 'Parcela Nº', 'Valor Parcela', 'Data Vencimento', 'Estado', 'Comprovativo', 'Ações']}
          loading={loading}
          empty={!loading && paginated.length === 0}
          emptyMessage="Nenhum pagamento localizado na base de dados."
        >
          {paginated.map(p => {
            const clienteNome = p.solicitacao?.cliente?.nome || 'Cliente'
            return (
              <tr key={p.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors">
                <td className="px-4 py-3 font-mono font-semibold text-zinc-900 dark:text-white">PAG-{p.id.toString().padStart(6, '0')}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900 dark:text-white text-xs">{clienteNome}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">Solicitação #SOL-{p.solicitacaoId}</p>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-zinc-700 dark:text-zinc-300 font-semibold">{p.numeroParcela}ª Parcela</td>
                <td className="px-4 py-3"><KzValue value={p.valorPago} /></td>
                <td className="px-4 py-3 text-xs font-mono text-zinc-600 dark:text-zinc-400">{p.dataVencimento}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3">
                  {p.comprativoReembolsoPath ? (
                    <AttachmentLink path={p.comprativoReembolsoPath} label="Ver Anexo" />
                  ) : (
                    <span className="text-[10px] text-zinc-400 italic">Sem anexo</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {p.status !== 'PROCESSADO' && (
                      <>
                        <BtnPrimary onClick={() => { setSelectedForPayment(p); setValorRecebido(Number(p.valorPago || 0)) }} icon={CheckCircle}>
                          Quitar
                        </BtnPrimary>
                        {p.comprativoReembolsoPath && (
                          <>
                            <IconBtn onClick={() => handleValidation(p.id, 'APROVAR')} disabled={validando === p.id} title="Aprovar Comprovativo" icon={CheckCircle2} />
                            <IconBtn onClick={() => handleValidation(p.id, 'REJEITAR')} disabled={validando === p.id} title="Rejeitar Comprovativo" icon={XCircle} />
                          </>
                        )}
                      </>
                    )}
                    {p.status === 'PROCESSADO' && (
                      <BtnSecondary onClick={() => setReceiptPayment(p)} icon={Printer}>
                        Recibo
                      </BtnSecondary>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </Table>
      </DataTable>

      {/* Modal Quitação Manual */}
      {selectedForPayment && (
        <Modal title={`Liquidar Parcela — PAG-${selectedForPayment.id}`} icon={CreditCard} onClose={() => setSelectedForPayment(null)}>
          <form onSubmit={handleLiquidarSubmit} className="space-y-3.5">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl space-y-1 text-xs">
              <p className="text-zinc-500 dark:text-zinc-400">Mutuário: <strong className="text-zinc-900 dark:text-white">{selectedForPayment.solicitacao?.cliente?.nome || 'Cliente'}</strong></p>
              <p className="text-zinc-500 dark:text-zinc-400">Parcela: <strong className="text-zinc-900 dark:text-white font-mono">{selectedForPayment.numeroParcela}ª Parcela</strong></p>
            </div>

            <FormField label="Valor Efetivamente Recebido (Kz)" required>
              <input type="number" step="100" value={valorRecebido} onChange={e => setValorRecebido(Number(e.target.value))} className={inputClass} required />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Juros de Mora (Kz)">
                <input type="number" step="100" value={jurosMoraManual} onChange={e => setJurosMoraManual(Number(e.target.value))} className={inputClass} />
              </FormField>
              <FormField label="Multa de Atraso (Kz)">
                <input type="number" step="100" value={multaManual} onChange={e => setMultaManual(Number(e.target.value))} className={inputClass} />
              </FormField>
            </div>

            <div className="p-3 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-400 font-sans">Total a Liquidar:</span>
              <span className="text-sm font-bold"><KzValue value={totalComAcrescidos} /></span>
            </div>

            <ModalFooter onCancel={() => setSelectedForPayment(null)}>
              <BtnPrimary type="submit" loading={isSubmitting} icon={CheckCircle}>
                {isSubmitting ? 'A Processar...' : 'Emitir Quitação & Recibo'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Modal Recibo Visual */}
      {receiptPayment && (
        <Modal title={`Recibo de Quitação — PAG-${receiptPayment.id}`} icon={FileText} onClose={() => setReceiptPayment(null)}>
          <div className="space-y-4 text-xs font-mono">
            <div className="p-5 bg-white border border-zinc-200/90 rounded-2xl shadow-xs space-y-3 text-zinc-900">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 font-sans">GLOXIS FINTECH S.A.</h4>
                  <p className="text-[10px] text-zinc-400">NIF: 5417089201 · Luanda, Angola</p>
                </div>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                  RECIBO Nº {receiptPayment.id}
                </span>
              </div>

              <div className="space-y-1.5 text-xs pt-1">
                <p className="text-zinc-500">Recebemos de: <strong className="text-zinc-900 font-sans">{receiptPayment.solicitacao?.cliente?.nome || 'Cliente'}</strong></p>
                <p className="text-zinc-500">A quantia de: <strong className="text-emerald-700 text-sm font-bold"><KzValue value={receiptPayment.valorPago} /></strong></p>
                <p className="text-zinc-500">Referente a: <strong className="text-zinc-800">{receiptPayment.numeroParcela}ª Parcela</strong> da Solicitação #SOL-{receiptPayment.solicitacaoId}</p>
                <p className="text-zinc-500">Data Liquidação: <strong className="text-zinc-800">{receiptPayment.dataPagamento || new Date().toLocaleDateString('pt-AO')}</strong></p>
              </div>

              <div className="border-t border-zinc-100 pt-3 flex justify-between items-center text-[10px] text-zinc-400">
                <span>Documento emitido eletronicamente via Gloxis ERP</span>
                <span>Assinatura Digital</span>
              </div>
            </div>

            <ModalFooter onCancel={() => setReceiptPayment(null)}>
              <BtnPrimary onClick={() => { window.print() }} icon={Download}>
                Imprimir Recibo
              </BtnPrimary>
            </ModalFooter>
          </div>
        </Modal>
      )}
    </PageShell>
  )
}
