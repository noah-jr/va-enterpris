import {
  PageShell, PageHeader, KpiCard, DataTable, Table, StatusBadge,
  Toolbar, FilterSelect, BtnPrimary, BtnSecondary, BtnSuccess,
  Modal, ModalFooter, FormField, inputClass, Toast,
  KzValue, BtnRefresh, BtnNew,
} from '../components/ui'
import { ClientSearchSelect } from '../components/ClientSearchSelect'
import { PaginationControl } from '../components/PaginationControl'
import {
  Handshake, CheckCircle, Clock, TrendingDown, PlusCircle
} from 'lucide-react'
import { useRenegociacoes } from '../hooks/useRenegociacoes'

export function Renegociacoes() {
  const {
    loading, search, setSearch, filterStatus, setFilterStatus,
    currentPage, setCurrentPage, perPage, setPerPage, actionLoading, toast,
    showCreateModal, setShowCreateModal, solicitacaoId, setSolicitacaoId,
    saldoOriginal, setSaldoOriginal, novoSaldo, setNovoSaldo,
    jurosPerdoados, setJurosPerdoados, multasPerdoadas, setMultasPerdoadas,
    novasParcelas, setNovasParcelas, novaTaxaJuros, setNovaTaxaJuros,
    isSubmitting, load, aprovar, handleCreateSubmit,
    totalItems, totalPages, paginated, totalReestruturado, totalPerdoado, pendentesCount,
  } = useRenegociacoes()

  return (
    <PageShell>
      {toast && <Toast message={toast.msg} type={toast.type} />}

      <PageHeader
        icon={Handshake}
        title="Refinanciamento & Renegociação de Dívidas"
        description="Reestruturação de contratos em atraso, perdão de mora e recalculo de prestações."
      >
        <BtnRefresh onClick={load} />
        <BtnNew onClick={() => setShowCreateModal(true)} label="Nova Renegociação" />
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <KpiCard icon={Handshake} iconBg="bg-zinc-100 dark:bg-zinc-800" iconColor="text-zinc-700 dark:text-zinc-300"
          label="Saldo Total Reestruturado" value={`Kz ${totalReestruturado.toLocaleString('pt-AO')}`} />
        <KpiCard icon={TrendingDown} iconBg="bg-emerald-50 dark:bg-emerald-950/60" iconColor="text-emerald-600 dark:text-emerald-400"
          label="Total Encargos Perdoados" value={`Kz ${totalPerdoado.toLocaleString('pt-AO')}`} />
        <KpiCard icon={Clock} iconBg="bg-amber-50 dark:bg-amber-950/60" iconColor="text-amber-600 dark:text-amber-400"
          label="Pedidos em Análise do Comité" value={String(pendentesCount)} />
      </div>

      {/* Table */}
      <DataTable
        toolbar={
          <Toolbar
            search={search}
            onSearchChange={v => { setSearch(v); setCurrentPage(1) }}
            searchPlaceholder="Pesquisar por ID, Solicitação, Mutuário..."
          >
            <FilterSelect
              value={filterStatus}
              onChange={v => { setFilterStatus(v); setCurrentPage(1) }}
              options={[
                { value: 'APROVADA', label: 'Aprovada' },
                { value: 'PENDENTE_APROVACAO', label: 'Pendente Aprovação' },
                { value: 'REJEITADA', label: 'Rejeitada' },
              ]}
              placeholder="Todos os Estados"
            />
          </Toolbar>
        }
        pagination={
          <PaginationControl
            currentPage={currentPage} totalPages={totalPages}
            totalItems={totalItems} perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={p => { setPerPage(p); setCurrentPage(1) }}
          />
        }
      >
        <Table
          headers={['ID Processo', 'Contrato Sol.', 'Saldo Original', 'Novo Saldo', 'Perdão', 'Plano', 'Estado', 'Ação']}
          loading={loading}
          empty={!loading && paginated.length === 0}
          emptyMessage="Nenhum acordo de renegociação localizado."
        >
          {paginated.map(r => (
            <tr key={r.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors">
              <td className="px-4 py-3 font-mono font-semibold text-zinc-900 dark:text-white">#{r.id.toString().padStart(4, '0')}</td>
              <td className="px-4 py-3 font-mono text-zinc-500 dark:text-zinc-400">#SOL-{r.solicitacaoId}</td>
              <td className="px-4 py-3"><KzValue value={r.saldoDevedorOriginal} className="text-rose-600 dark:text-rose-400" /></td>
              <td className="px-4 py-3"><KzValue value={r.novoSaldoDevedor} /></td>
              <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                <span className="block text-amber-700 dark:text-amber-400">Mora: Kz {Number(r.jurosMoraPerdoados).toLocaleString('pt-AO')}</span>
                <span className="block text-amber-700 dark:text-amber-400">Multa: Kz {Number(r.multasPerdoadas).toLocaleString('pt-AO')}</span>
              </td>
              <td className="px-4 py-3 text-xs font-mono text-zinc-600 dark:text-zinc-300">{r.novasParcelas}m @ {r.novaTaxaJuros}%</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3 text-right">
                {r.status === 'PENDENTE_APROVACAO' ? (
                  <BtnSuccess onClick={() => aprovar(r.id)} disabled={actionLoading === r.id} loading={actionLoading === r.id} icon={CheckCircle}>
                    Aprovar
                  </BtnSuccess>
                ) : <span className="text-xs text-zinc-300 dark:text-zinc-600">—</span>}
              </td>
            </tr>
          ))}
        </Table>
      </DataTable>

      {/* Modal Nova Renegociação */}
      {showCreateModal && (
        <Modal title="Proposta de Refinanciamento / Renegociação" icon={PlusCircle} onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateSubmit} className="space-y-3.5">
            <FormField label="Cliente / Mutuário">
              <ClientSearchSelect
                value={solicitacaoId ? Number(solicitacaoId) : null}
                onChange={(clientId) => setSolicitacaoId(clientId ? String(clientId) : '')}
                placeholder="Pesquisar por Nome, NIF, Email..."
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Saldo Devedor Original (Kz)" required>
                <input type="number" value={saldoOriginal} onChange={e => setSaldoOriginal(Number(e.target.value))}
                  className={inputClass} required />
              </FormField>
              <FormField label="Novo Saldo Reestruturado (Kz)" required>
                <input type="number" value={novoSaldo} onChange={e => setNovoSaldo(Number(e.target.value))}
                  className={inputClass} required />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Juros Mora Perdoados (Kz)">
                <input type="number" value={jurosPerdoados} onChange={e => setJurosPerdoados(Number(e.target.value))}
                  className={inputClass} />
              </FormField>
              <FormField label="Multas Perdoadas (Kz)">
                <input type="number" value={multasPerdoadas} onChange={e => setMultasPerdoadas(Number(e.target.value))}
                  className={inputClass} />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Novas Parcelas (Meses)" required>
                <input type="number" value={novasParcelas} onChange={e => setNovasParcelas(Number(e.target.value))}
                  className={inputClass} required />
              </FormField>
              <FormField label="Nova Taxa Juros (% a.m.)" required>
                <input type="number" step="0.1" value={novaTaxaJuros} onChange={e => setNovaTaxaJuros(Number(e.target.value))}
                  className={inputClass} required />
              </FormField>
            </div>

            <ModalFooter onCancel={() => setShowCreateModal(false)}>
              <BtnPrimary type="submit" loading={isSubmitting} icon={PlusCircle}>
                {isSubmitting ? 'A Submeter...' : 'Submeter Proposta'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </PageShell>
  )
}
