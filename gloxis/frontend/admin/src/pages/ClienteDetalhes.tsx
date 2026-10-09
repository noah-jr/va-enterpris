import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'
import { Avatar } from '../components/Avatar'
import { AttachmentLink } from '../components/AttachmentLink'
import {
  PageShell, PageHeader, StatusBadge, BtnPrimary, BtnSecondary, BtnDanger,
  Modal, ModalFooter, FormField, inputClass, selectClass, KzValue, SectionCard
} from '../components/ui'
import {
  ArrowLeft, Edit, Trash2, CreditCard, Save, PlusCircle,
  Receipt, ShieldCheck, MessageSquare,
  Upload, Download, AlertTriangle, Clock, Banknote, Send, UserCheck
} from 'lucide-react'
import { useClienteDetalhes, type Credito } from '../hooks/useClienteDetalhes'
import { ClientPaymentChannelsCard } from '../components/ClientPaymentChannelsCard'

function CreditoAdminCard({ credito: c, onRefresh }: { credito: Credito; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [timeline, setTimeline] = useState<{
    resumo: { parcelasPagas: number; totalParcelas: number }
    solicitacao: { dataInicioPagamento?: string; dataVencimentoFinal?: string; diasParaFim?: number | null; comprovativoDesembolsoPath?: string }
    parcelas: Array<{ id: number; numeroParcela: number; valorParcela: number | string; status: string; atrasada?: boolean; diasRestantes: number; comprativoReembolsoPath?: string; dataVencimento?: string }>
  } | null>(null)
  const [loadingTimeline, setLoadingTimeline] = useState(false)
  const [desembolsando, setDesembolsando] = useState(false)
  const [showDesembolsoForm, setShowDesembolsoForm] = useState(false)
  const [validando, setValidando] = useState<number | null>(null)

  const loadTimeline = useCallback(async () => {
    if (!expanded) return
    setLoadingTimeline(true)
    try {
      const res = await api.get(`/operacoes/solicitacoes/${c.id}/parcelas`)
      setTimeline(res.data?.data)
    } catch { setTimeline(null) }
    finally { setLoadingTimeline(false) }
  }, [c.id, expanded])

  useEffect(() => { loadTimeline() }, [loadTimeline])

  const handleDesembolso = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setDesembolsando(true)
    try {
      const fd = new FormData(e.currentTarget)
      fd.append('solicitacaoId', String(c.id))
      await api.post('/operacoes/desembolsos', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      alert('✅ Desembolso realizado! Cliente foi notificado.')
      setShowDesembolsoForm(false)
      onRefresh()
      await loadTimeline()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error || (err as { message?: string }).message
      alert('Erro: ' + msg)
    } finally { setDesembolsando(false) }
  }

  const handleValidar = async (pagamentoId: number, status: 'PROCESSADO' | 'REJEITADO') => {
    setValidando(pagamentoId)
    try {
      await api.patch(`/operacoes/pagamentos/${pagamentoId}/validar`, { status })
      alert(status === 'PROCESSADO' ? '✅ Pagamento confirmado!' : '⚠️ Comprovativo rejeitado.')
      await loadTimeline()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error || (err as { message?: string }).message
      alert('Erro: ' + msg)
    } finally { setValidando(null) }
  }

  const progressoParcelas = timeline
    ? Math.round((timeline.resumo.parcelasPagas / Math.max(timeline.resumo.totalParcelas, 1)) * 100)
    : 0

  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
      <div
        className="flex justify-between items-center p-4 cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={c.status} />
              <span className="text-[10px] text-zinc-400 font-mono">{new Date(c.created_at || c.createdAt || Date.now()).toLocaleDateString('pt-AO')}</span>
            </div>
            <div className="text-sm font-bold text-zinc-900 dark:text-white font-mono mt-1"><KzValue value={c.valor} /></div>
            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{c.parcelas}x parcelas — {c.finalidade || 'Microcrédito'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {c.status === 'APROVADO' && !timeline?.solicitacao?.dataInicioPagamento && (
            <BtnSecondary
              onClick={() => { setShowDesembolsoForm(true) }}
              icon={Banknote}
            >
              Desembolsar
            </BtnSecondary>
          )}
          <span className="text-zinc-400 text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {showDesembolsoForm && (
        <div className="border-t border-zinc-200 dark:border-zinc-700 p-4 bg-white dark:bg-zinc-900 space-y-3">
          <p className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2"><Upload className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" /> Realizar Desembolso</p>
          <form onSubmit={handleDesembolso} className="flex flex-col gap-3">
            <FormField label="Método de Pagamento">
              <select name="metodo" defaultValue="TRANSFERENCIA" className={selectClass}>
                <option value="TRANSFERENCIA">Transferência Bancária</option>
                <option value="CHEQUE">Cheque</option>
                <option value="DINHEIRO">Dinheiro Vivo</option>
              </select>
            </FormField>
            <FormField label="Comprovativo de Transferência" required>
              <input name="comprovativo" type="file" required accept=".pdf,.jpg,.jpeg,.png" className="w-full text-xs text-zinc-600 dark:text-zinc-300 file:mr-3 file:py-1 file:px-3 file:border-0 file:text-xs file:font-semibold file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-800 dark:file:text-zinc-200 hover:file:bg-zinc-200 dark:hover:file:bg-zinc-700 cursor-pointer" />
            </FormField>
            <div className="flex gap-2 justify-end pt-2">
              <BtnSecondary onClick={() => setShowDesembolsoForm(false)}>Cancelar</BtnSecondary>
              <BtnPrimary type="submit" loading={desembolsando} icon={Send}>
                {desembolsando ? 'A Processar...' : 'Confirmar Desembolso'}
              </BtnPrimary>
            </div>
          </form>
        </div>
      )}

      {expanded && (
        <div className="border-t border-zinc-200 dark:border-zinc-700 p-4 bg-white dark:bg-zinc-900 space-y-3">
          {loadingTimeline ? (
            <div className="text-center py-6 text-zinc-400 text-xs">A carregar parcelas...</div>
          ) : timeline ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[['Início', timeline.solicitacao.dataInicioPagamento], ['Fim', timeline.solicitacao.dataVencimentoFinal], ['Dias p/ fim', timeline.solicitacao.diasParaFim !== null && timeline.solicitacao.diasParaFim !== undefined ? `${timeline.solicitacao.diasParaFim} dias` : '—']].map(([l, v]) => (
                  <div key={l as string} className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 p-2.5 text-center">
                    <p className="text-[10px] text-zinc-400 uppercase font-semibold">{l}</p>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white mt-0.5">{typeof v === 'string' && v.includes('-') && v.length > 6 ? new Date(v).toLocaleDateString('pt-AO') : (v as string) || '—'}</p>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Parcelas pagas: {timeline.resumo.parcelasPagas}/{timeline.resumo.totalParcelas}</span>
                  <span className="text-zinc-900 dark:text-white font-bold">{progressoParcelas}%</span>
                </div>
                <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div style={{ width: `${progressoParcelas}%` }} className="h-full bg-zinc-900 dark:bg-white transition-all duration-700" />
                </div>
              </div>

              <AttachmentLink
                path={timeline.solicitacao.comprovativoDesembolsoPath}
                label="Comprovativo de desembolso (enviado pelo admin)"
                className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              />

              {timeline.parcelas.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Calendário de Reembolso</p>
                  {timeline.parcelas.map(p => {
                    const hasProof = !!p.comprativoReembolsoPath
                    const needsValidation = hasProof && p.status === 'PENDENTE'
                    return (
                      <div key={p.id} className="flex flex-col gap-2 p-3 border border-zinc-200/80 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-xs">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white">Parcela {p.numeroParcela}</span>
                            <span className="text-zinc-500 dark:text-zinc-400 ml-2 font-mono"><KzValue value={p.valorParcela} /></span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {p.atrasada && <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 text-[10px] font-semibold"><AlertTriangle className="w-3 h-3" />{Math.abs(p.diasRestantes)}d atraso</span>}
                            <StatusBadge status={p.status} />
                          </div>
                        </div>
                        {hasProof && (
                          <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-zinc-100 dark:border-zinc-700">
                            <AttachmentLink
                              path={p.comprativoReembolsoPath}
                              label="Ver comprovativo do cliente"
                              className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                              icon={<Download className="w-3 h-3" />}
                            />
                            {needsValidation && (
                              <div className="flex gap-1.5 ml-auto">
                                <BtnPrimary onClick={() => handleValidar(p.id, 'PROCESSADO')} disabled={validando === p.id} icon={ShieldCheck}>
                                  Confirmar
                                </BtnPrimary>
                                <BtnDanger onClick={() => handleValidar(p.id, 'REJEITADO')} disabled={validando === p.id} icon={X}>
                                  Rejeitar
                                </BtnDanger>
                              </div>
                            )}
                          </div>
                        )}
                        <span className="text-[10px] text-zinc-400 font-mono">Vencimento: {p.dataVencimento ? new Date(p.dataVencimento).toLocaleDateString('pt-AO') : '—'}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-zinc-400 text-xs">Sem parcelas. Realize o desembolso para gerar o calendário.</div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-zinc-400 text-xs">Nenhuma timeline disponível.</div>
          )}
        </div>
      )}
    </div>
  )
}

export function ClienteDetalhes() {
  const {
    navigate, cliente, loading, isEditing, setIsEditing, formData, setFormData,
    showCreditModal, setShowCreditModal, creditValor, setCreditValor,
    creditParcelas, setCreditParcelas, creditFinalidade, setCreditFinalidade,
    isSubmittingCredit, showInvoiceModal, setShowInvoiceModal, invoiceValor,
    setInvoiceValor, invoiceDescricao, setInvoiceDescricao, isSubmittingInvoice,
    loadProfile, handleSave, handleDelete, handleCreateCredit, handleCreateInvoice, openEditForm,
  } = useClienteDetalhes()

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-7 h-7 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </PageShell>
    )
  }

  if (!cliente) return null

  return (
    <PageShell>
      <PageHeader
        icon={UserCheck}
        title={`Dossier da Entidade — ${cliente.nome}`}
        description={`ID: ${cliente.id} • NIF: ${cliente.nif} • Registo CRM Integrado`}
      >
        <BtnSecondary onClick={() => navigate('/clientes')} icon={ArrowLeft}>
          Voltar a Clientes
        </BtnSecondary>
        {!isEditing && (
          <>
            <BtnDanger onClick={handleDelete} icon={Trash2}>
              Remover
            </BtnDanger>
            <BtnPrimary onClick={openEditForm} icon={Edit}>
              Editar Perfil
            </BtnPrimary>
          </>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Identificação e Score */}
        <div className="space-y-5">
          <SectionCard className="flex flex-col items-center text-center p-6 space-y-3">
            <Avatar src={cliente.fotografia || cliente.logotipo} name={cliente.nome} className="!w-24 !h-24 !text-3xl border-2 border-zinc-200 dark:border-zinc-700 shadow-sm" />
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">{cliente.nome}</h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">NIF: {cliente.nif}</p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <StatusBadge status={cliente.risco || 'BAIXO'} label={`Risco ${cliente.risco}`} />
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200">
                Score: {cliente.scoreCredito ?? 0} pts
              </span>
            </div>
          </SectionCard>

          <SectionCard className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-2">Informação de Contacto</h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <p className="text-[10px] uppercase font-semibold text-zinc-400">E-mail Corporativo</p>
                <p className="font-semibold text-zinc-900 dark:text-white font-mono">{cliente.email || 'Não definido'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-zinc-400">Telefone</p>
                <p className="font-semibold text-zinc-900 dark:text-white">{cliente.telefone || 'Não definido'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-zinc-400">Endereço de Faturação</p>
                <p className="text-zinc-700 dark:text-zinc-300">{cliente.endereco || 'Não definido'}</p>
              </div>
            </div>
          </SectionCard>

          <ClientPaymentChannelsCard
            contaBancariaRaw={cliente.contaBancaria || cliente.conta_bancaria}
            onSavePaymentDetails={async (newRaw) => {
              if (!cliente?.id) return
              try {
                await updateMutation.mutateAsync({ contaBancaria: newRaw })
              } catch (err) {
                console.error(err)
                alert('Erro ao guardar canais de pagamento.')
              }
            }}
          />
        </div>

        {/* Conteúdo Central/Direito */}
        <div className="lg:col-span-2 space-y-5">
          {isEditing ? (
            <SectionCard className="space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Modo de Edição de Perfil</h3>
                <BtnSecondary onClick={() => setIsEditing(false)}>Cancelar</BtnSecondary>
              </div>
              <form id="edit-form" onSubmit={handleSave} className="space-y-3.5">
                <FormField label="Nome / Razão Social" required>
                  <input type="text" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} className={inputClass} required />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="NIF" required>
                    <input type="text" value={formData.nif} onChange={e => setFormData({ ...formData, nif: e.target.value })} className={inputClass} required />
                  </FormField>
                  <FormField label="Telefone">
                    <input type="text" value={formData.telefone} onChange={e => setFormData({ ...formData, telefone: e.target.value })} className={inputClass} />
                  </FormField>
                </div>
                <FormField label="E-mail">
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
                </FormField>
                <FormField label="Endereço de Faturação">
                  <textarea rows={2} value={formData.endereco} onChange={e => setFormData({ ...formData, endereco: e.target.value })} className={`${inputClass} resize-none`} />
                </FormField>
                <FormField label="IBAN">
                  <input type="text" value={formData.contaBancaria} onChange={e => setFormData({ ...formData, contaBancaria: e.target.value })} className={inputClass} />
                </FormField>
                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <BtnSecondary onClick={() => setIsEditing(false)}>Cancelar</BtnSecondary>
                  <BtnPrimary type="submit" icon={Save}>Guardar Alterações</BtnPrimary>
                </div>
              </form>
            </SectionCard>
          ) : (
            <>
              {/* Histórico de Créditos */}
              <SectionCard className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-zinc-700 dark:text-zinc-300" /> Operações de Crédito Concedidas
                  </h3>
                  <BtnPrimary onClick={() => setShowCreditModal(true)} icon={PlusCircle}>
                    Conceder Crédito
                  </BtnPrimary>
                </div>
                {cliente.creditos && cliente.creditos.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {cliente.creditos.map((c, i) => (
                      <CreditoAdminCard key={i} credito={c} onRefresh={loadProfile} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-400 bg-zinc-50/50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700 border-dashed text-xs">
                    Nenhuma operação de crédito registada para este cliente.
                  </div>
                )}
              </SectionCard>

              {/* Faturas Emitidas */}
              <SectionCard className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-zinc-700 dark:text-zinc-300" /> Faturas Emitidas à Entidade
                  </h3>
                  <BtnPrimary onClick={() => setShowInvoiceModal(true)} icon={Receipt}>
                    Emitir Fatura AGT
                  </BtnPrimary>
                </div>
                {cliente.faturas && cliente.faturas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cliente.faturas.map((f, i) => (
                      <div key={i} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 p-3">
                        <div>
                          <p className="text-[10px] font-mono text-zinc-400">FT {f.numero_fatura || f.numeroFatura}</p>
                          <p className="text-xs font-bold text-zinc-900 dark:text-white font-mono mt-0.5"><KzValue value={f.valor_total || f.valorTotal} /></p>
                        </div>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 font-mono">
                          {new Date(f.created_at || f.createdAt || Date.now()).toLocaleDateString('pt-AO')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-400 bg-zinc-50/50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700 border-dashed text-xs">
                    Nenhuma fatura associada à entidade.
                  </div>
                )}
              </SectionCard>

              {/* Comunicações */}
              <SectionCard className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-zinc-700 dark:text-zinc-300" /> Histórico de Comunicações
                  </h3>
                </div>
                {cliente.mensagens && cliente.mensagens.length > 0 ? (
                  <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto">
                    {cliente.mensagens.map((m, i) => (
                      <div key={i} className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 p-3 space-y-1">
                        <div className="flex justify-between items-start text-[10px]">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5">
                            {m.remetente_nome === cliente.nome ? 'RECEBIDA (Cliente)' : 'ENVIADA (Admin)'}
                          </span>
                          <span className="text-zinc-400 font-mono">{new Date(m.created_at || m.createdAt || Date.now()).toLocaleString('pt-AO')}</span>
                        </div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white mt-1">{m.assunto}</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 whitespace-pre-line">{m.conteudo}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-400 bg-zinc-50/50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700 border-dashed text-xs">
                    Nenhuma mensagem registada.
                  </div>
                )}
              </SectionCard>
            </>
          )}
        </div>
      </div>

      {/* Modal Crédito */}
      {showCreditModal && (
        <Modal title={`Conceder Microcrédito — ${cliente.nome}`} icon={CreditCard} onClose={() => setShowCreditModal(false)}>
          <form onSubmit={handleCreateCredit} className="space-y-3.5">
            <FormField label="Montante do Crédito (Kz)" required>
              <input type="number" step="100000" value={creditValor} onChange={e => setCreditValor(Number(e.target.value))} className={inputClass} required />
            </FormField>
            <FormField label="Prazo de Amortização" required>
              <select value={creditParcelas} onChange={e => setCreditParcelas(Number(e.target.value))} className={selectClass}>
                <option value={3}>3 Meses</option>
                <option value={6}>6 Meses</option>
                <option value={12}>12 Meses</option>
                <option value={24}>24 Meses</option>
                <option value={36}>36 Meses</option>
              </select>
            </FormField>
            <FormField label="Finalidade Corporativa" required>
              <input type="text" value={creditFinalidade} onChange={e => setCreditFinalidade(e.target.value)} className={inputClass} required />
            </FormField>
            <ModalFooter onCancel={() => setShowCreditModal(false)}>
              <BtnPrimary type="submit" loading={isSubmittingCredit} icon={PlusCircle}>
                {isSubmittingCredit ? 'A Submeter...' : 'Submeter Crédito'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Modal Fatura */}
      {showInvoiceModal && (
        <Modal title={`Emitir Fatura AGT — ${cliente.nome}`} icon={Receipt} onClose={() => setShowInvoiceModal(false)}>
          <form onSubmit={handleCreateInvoice} className="space-y-3.5">
            <FormField label="Valor Total da Fatura (Kz)" required>
              <input type="number" step="10000" value={invoiceValor} onChange={e => setInvoiceValor(Number(e.target.value))} className={inputClass} required />
            </FormField>
            <FormField label="Descrição / Serviço Faturado" required>
              <input type="text" value={invoiceDescricao} onChange={e => setInvoiceDescricao(e.target.value)} className={inputClass} required />
            </FormField>
            <ModalFooter onCancel={() => setShowInvoiceModal(false)}>
              <BtnPrimary type="submit" loading={isSubmittingInvoice} icon={Receipt}>
                {isSubmittingInvoice ? 'A Emitir...' : 'Emitir Fatura AGT'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </PageShell>
  )
}
