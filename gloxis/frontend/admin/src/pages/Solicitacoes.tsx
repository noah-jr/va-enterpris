import { useNavigate } from 'react-router'
import {
  PageShell, PageHeader, KpiCard, DataTable, Table, StatusBadge,
  Toolbar, FilterSelect, BtnPrimary, BtnDanger, Modal, ModalFooter,
  FormField, selectClass, KzValue, BtnNew, Toast, IconBtn, BtnRefresh
} from '../components/ui'
import { useSolicitacoes } from '../hooks/useSolicitacoes'
import { PdfViewerModal } from '../components/PdfViewerModal'
import { ClientSearchSelect } from '../components/ClientSearchSelect'
import { PaginationControl } from '../components/PaginationControl'
import {
  FileText, CheckCircle, XCircle, Clock,
  DollarSign, ShieldCheck, Plus, Eye, AlertTriangle
} from 'lucide-react'

export function Solicitacoes() {
  const navigate = useNavigate()
  const {
    getApiUrl, loading, search, setSearch, statusFilter, setStatusFilter,
    currentPage, setCurrentPage, perPage, setPerPage, actionLoading, toast,
    pdfModal, setPdfModal, selectedForAnalysis, setSelectedForAnalysis,
    selectedForRejection, setSelectedForRejection, parecerCredito, setParecerCredito,
    motivoRejeicao, setMotivoRejeicao, desembolsoMode, setDesembolsoMode,
    desembolsando, showCreateModal, setShowCreateModal, selectedCliente,
    setSelectedCliente, newValor, setNewValor, newParcelas, setNewParcelas,
    newFinalidade, setNewFinalidade, isSubmittingNew, load, updateStatus,
    handleConfirmRejection, handleDesembolsoSubmit, handleCreateSubmit, totalItems, totalPages, paginated,
  } = useSolicitacoes()

  return (
    <PageShell>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <PageHeader
        icon={FileText}
        title="Gestão de Solicitações de Crédito"
        description="Mesa de análise, aprovação formal, emissão de parecer, justificação de rejeições e liquidação/desembolso."
      >
        <BtnRefresh onClick={load} loading={loading} />
        <BtnNew onClick={() => setShowCreateModal(true)} label="Nova Solicitação" />
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard icon={Clock} iconBg="bg-amber-50 dark:bg-amber-950/60" iconColor="text-amber-600 dark:text-amber-400"
          label="Em Análise / Pendentes" value={String(paginated.filter(s => s.status === 'PENDENTE' || s.status === 'EM_ANALISE').length)} sub="Aguardam parecer" />
        <KpiCard icon={ShieldCheck} iconBg="bg-emerald-50 dark:bg-emerald-950/60" iconColor="text-emerald-600 dark:text-emerald-400"
          label="Aprovadas" value={String(paginated.filter(s => s.status === 'APROVADO' || s.status === 'APROVADA').length)} sub="Aguardam desembolso" />
        <KpiCard icon={XCircle} iconBg="bg-rose-50 dark:bg-rose-950/60" iconColor="text-rose-600 dark:text-rose-400"
          label="Reprovadas / Recusadas" value={String(paginated.filter(s => s.status === 'REJEITADO' || s.status === 'REPROVADO' || s.status === 'REJEITADA').length)} sub="Não enquadradas" />
        <KpiCard icon={DollarSign} iconBg="bg-zinc-100 dark:bg-zinc-800" iconColor="text-zinc-700 dark:text-zinc-300"
          label="Total de Pedidos" value={String(totalItems)} sub="Volume total registado" />
      </div>

      {/* Table */}
      <DataTable
        toolbar={
          <Toolbar
            search={search}
            onSearchChange={v => { setSearch(v); setCurrentPage(1); }}
            searchPlaceholder="Pesquisar por Cliente, NIF..."
          >
            <FilterSelect
              value={statusFilter}
              onChange={v => { setStatusFilter(v); setCurrentPage(1); }}
              options={[
                { value: 'PENDENTE', label: 'Pendentes' },
                { value: 'APROVADO', label: 'Aprovados' },
                { value: 'REJEITADO', label: 'Rejeitados / Reprovados' },
                { value: 'DESEMBOLSADO', label: 'Desembolsados' },
              ]}
              placeholder="Todos os Estados"
            />
          </Toolbar>
        }
        pagination={
          <PaginationControl
            currentPage={currentPage} totalPages={totalPages} totalItems={totalItems}
            perPage={perPage} onPageChange={setCurrentPage} onPerPageChange={p => { setPerPage(p); setCurrentPage(1); }}
          />
        }
      >
        <Table
          headers={['Nº Pedido', 'Cliente / Mutuário', 'Valor Solicitado', 'Prazo', 'Estado', 'Ações']}
          loading={loading}
          empty={!loading && paginated.length === 0}
          emptyMessage="Nenhuma solicitação de crédito encontrada."
        >
          {paginated.map(s => {
            const clienteNome = s.cliente?.nome || s.clienteNome || 'Cliente'
            const isPendente = s.status === 'PENDENTE' || s.status === 'EM_ANALISE'
            const isAprovado = s.status === 'APROVADO' || s.status === 'APROVADA'

            return (
              <tr key={s.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors">
                <td
                  onClick={() => navigate(`/solicitacoes/${s.id}`)}
                  className="px-4 py-3 font-mono font-semibold text-zinc-900 dark:text-white cursor-pointer hover:underline"
                >
                  SOL-{s.id.toString().padStart(5, '0')}
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900 dark:text-white text-xs">{clienteNome}</p>
                  {s.cliente?.nif && <p className="text-[10px] font-mono text-zinc-400">NIF: {s.cliente.nif}</p>}
                </td>
                <td className="px-4 py-3"><KzValue value={s.valorSolicitado || s.valor} /></td>
                <td className="px-4 py-3 text-xs font-mono text-zinc-700 dark:text-zinc-300">{s.prazoMeses || s.numParcelas || s.parcelas || 12} Meses</td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                  {s.motivoRejeicao && (
                    <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5 line-clamp-1 italic" title={s.motivoRejeicao}>
                      Motivo: {s.motivoRejeicao}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {s.comprovativoUrl && (
                      <IconBtn onClick={() => setPdfModal({ isOpen: true, url: getApiUrl(s.comprovativoUrl!), title: `Comprovativo — SOL-${s.id}` })}
                        title="Ver Comprovativo" icon={Eye} />
                    )}
                    {isPendente && (
                      <>
                        <BtnPrimary onClick={() => navigate(`/solicitacoes/${s.id}`)} icon={ShieldCheck}>
                          Analisar
                        </BtnPrimary>
                        <BtnDanger onClick={() => { setSelectedForRejection(s); setMotivoRejeicao('') }} icon={XCircle}>
                          Rejeitar
                        </BtnDanger>
                      </>
                    )}
                    {isAprovado && (
                      <BtnPrimary onClick={() => { setSelectedForAnalysis(s); setDesembolsoMode(true) }} icon={DollarSign}>
                        Desembolsar
                      </BtnPrimary>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </Table>
      </DataTable>

      {/* Modal Analisar / Desembolsar */}
      {selectedForAnalysis && (
        <Modal
          title={desembolsoMode ? `Desembolso de Crédito — SOL-${selectedForAnalysis.id}` : `Mesa de Análise — SOL-${selectedForAnalysis.id}`}
          icon={desembolsoMode ? DollarSign : ShieldCheck}
          onClose={() => setSelectedForAnalysis(null)}
        >
          <div className="space-y-4">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-1 text-xs">
              <p className="text-zinc-500 dark:text-zinc-400">Mutuário: <strong className="text-zinc-900 dark:text-white">{selectedForAnalysis.cliente?.nome || selectedForAnalysis.clienteNome}</strong></p>
              <p className="text-zinc-500 dark:text-zinc-400">Valor Solicitado: <strong className="text-zinc-900 dark:text-white font-mono">Kz {Number(selectedForAnalysis.valorSolicitado || selectedForAnalysis.valor || 0).toLocaleString('pt-AO')}</strong></p>
              <p className="text-zinc-500 dark:text-zinc-400">Finalidade: <strong className="text-zinc-900 dark:text-white">{selectedForAnalysis.finalidade || 'Capital de Giro'}</strong></p>
            </div>

            {desembolsoMode ? (
              <form onSubmit={handleDesembolsoSubmit} className="space-y-3.5">
                <FormField label="Instrução de Transferência / Conta de Saída">
                  <select className={selectClass}>
                    <option value="CONTA_PRINCIPAL">Conta Corrente Principal - BFA (IBAN ...8890)</option>
                    <option value="CONTA_SECUNDARIA">Conta Operacional - BAI (IBAN ...1120)</option>
                  </select>
                </FormField>
                <ModalFooter onCancel={() => setSelectedForAnalysis(null)}>
                  <BtnPrimary type="submit" loading={desembolsando} icon={CheckCircle}>
                    {desembolsando ? 'A Processar...' : 'Confirmar & Transferir Fundos'}
                  </BtnPrimary>
                </ModalFooter>
              </form>
            ) : (
              <div className="space-y-3.5">
                <FormField label="Parecer da Comissão de Risco & Crédito">
                  <textarea rows={2} value={parecerCredito} onChange={e => setParecerCredito(e.target.value)}
                    placeholder="Registe fundamentação técnica para aprovação..."
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-white resize-none" />
                </FormField>

                <FormField label="Justificativa / Motivo de Rejeição (Preencher apenas se for Rejeitar)" hint="Obrigatório para efetuar o indeferimento da solicitação.">
                  <textarea rows={2} value={motivoRejeicao} onChange={e => setMotivoRejeicao(e.target.value)}
                    placeholder="Especifique a razão técnica do indeferimento (ex: Rácio de DSR excessivo, incidentes no BNA...)"
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500 resize-none" />
                </FormField>

                <ModalFooter onCancel={() => setSelectedForAnalysis(null)}>
                  <BtnDanger
                    onClick={() => handleConfirmRejection()}
                    loading={actionLoading === selectedForAnalysis.id}
                    icon={XCircle}
                  >
                    Rejeitar Pedido
                  </BtnDanger>
                  <BtnPrimary
                    onClick={() => updateStatus(selectedForAnalysis.id, 'APROVADO')}
                    loading={actionLoading === selectedForAnalysis.id}
                    icon={CheckCircle}
                  >
                    Aprovar Crédito
                  </BtnPrimary>
                </ModalFooter>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Modal Dedicado de Rejeição com Justificativa */}
      {selectedForRejection && (
        <Modal
          title={`Indeferimento de Crédito — SOL-${selectedForRejection.id.toString().padStart(5, '0')}`}
          icon={XCircle}
          onClose={() => setSelectedForRejection(null)}
        >
          <form onSubmit={handleConfirmRejection} className="space-y-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-200 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Confirmação de Indeferimento Formal</span>
              </div>
              <p className="text-rose-700 dark:text-rose-300">
                Mutuário: <strong>{selectedForRejection.cliente?.nome || selectedForRejection.clienteNome}</strong>
              </p>
              <p className="text-rose-700 dark:text-rose-300">
                Valor Pedido: <strong className="font-mono">Kz {Number(selectedForRejection.valorSolicitado || selectedForRejection.valor || 0).toLocaleString('pt-AO')}</strong>
              </p>
            </div>

            <FormField label="Justificativa / Motivo da Rejeição (Obrigatório)" required hint="A informação registada será guardada na ficha do mutuário e enviada ao cliente.">
              <textarea
                rows={3}
                required
                value={motivoRejeicao}
                onChange={e => setMotivoRejeicao(e.target.value)}
                placeholder="Indique os fundamentos técnicos (ex: Capacidade financeira insuficiente, incumprimentos anteriores, rácio de solvabilidade inadequado...)"
                className="w-full bg-white dark:bg-zinc-800 border border-rose-300 dark:border-rose-700 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500 resize-none"
              />
            </FormField>

            <ModalFooter onCancel={() => setSelectedForRejection(null)}>
              <BtnDanger type="submit" loading={actionLoading === selectedForRejection.id} icon={XCircle}>
                Confirmar Rejeição & Enviar Justificativa
              </BtnDanger>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Modal Nova Solicitação */}
      {showCreateModal && (
        <Modal title="Submeter Nova Solicitação de Crédito" icon={FileText} onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateSubmit} className="space-y-3.5">
            <FormField label="Pesquisar Cliente / Mutuário" required>
              <ClientSearchSelect value={selectedCliente} onChange={(_, client) => setSelectedCliente(client)} placeholder="Digitar nome ou NIF..." />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Valor do Crédito (Kz)" required>
                <input type="number" step="10000" value={newValor} onChange={e => setNewValor(Number(e.target.value))} className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors" required />
              </FormField>
              <FormField label="Número de Prestações (Meses)" required>
                <input type="number" min="1" max="60" value={newParcelas} onChange={e => setNewParcelas(Number(e.target.value))} className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors" required />
              </FormField>
            </div>

            <FormField label="Finalidade do Crédito">
              <input type="text" value={newFinalidade} onChange={e => setNewFinalidade(e.target.value)}
                placeholder="Ex: Capital de giro para tesouraria" className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors" />
            </FormField>

            <ModalFooter onCancel={() => setShowCreateModal(false)}>
              <BtnPrimary type="submit" loading={isSubmittingNew} icon={Plus}>
                {isSubmittingNew ? 'A Submeter...' : 'Criar Solicitação'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}

      <PdfViewerModal isOpen={pdfModal.isOpen} url={pdfModal.url} title={pdfModal.title} onClose={() => setPdfModal({ isOpen: false, url: '', title: '' })} />
    </PageShell>
  )
}
