import {
  PageShell, PageHeader, KpiCard, DataTable, Table, StatusBadge,
  Toolbar, FilterSelect, BtnPrimary, Modal, ModalFooter,
  FormField, inputClass, selectClass, Toast, KzValue, BtnRefresh, BtnNew,
} from '../components/ui'
import { ClientSearchSelect } from '../components/ClientSearchSelect'
import { PaginationControl } from '../components/PaginationControl'
import { ShieldCheck, Building, Calculator, PlusCircle } from 'lucide-react'
import { useGarantias } from '../hooks/useGarantias'
import type { Garantia } from '../hooks/useGarantias'

export function Garantias() {
  const {
    garantias, search, setSearch, statusFilter, setStatusFilter,
    currentPage, setCurrentPage, perPage, setPerPage, loading, toast,
    showAddModal, setShowAddModal, solicitacaoId, setSolicitacaoId,
    tipo, setTipo, descricao, setDescricao, valorEstimado, setValorEstimado,
    isSubmitting, selectedForEval, setSelectedForEval,
    valorAvaliadoManual, setValorAvaliadoManual, parecerAvaliacao, setParecerAvaliacao,
    loadGarantias, handleAddSubmit, handleAvaliarSubmit,
    totalItems, totalPages, paginated, totalAvaliado,
  } = useGarantias()

  return (
    <PageShell>
      {toast && <Toast message={toast.msg} type={toast.type} />}

      <PageHeader
        icon={ShieldCheck}
        title="Gestão de Garantias Real & Colaterais"
        description="Avaliação pericial de imóveis, veículos, penhor mercantil e cálculo de cobertura LTV."
      >
        <BtnRefresh onClick={loadGarantias} />
        <BtnNew onClick={() => setShowAddModal(true)} label="Registar Garantia" />
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <KpiCard icon={Building} iconBg="bg-emerald-50" iconColor="text-emerald-600"
          label="Total Colaterais Aprovados" value={`Kz ${totalAvaliado.toLocaleString('pt-AO')}`} />
        <KpiCard icon={Calculator} iconBg="bg-zinc-100" iconColor="text-zinc-700"
          label="Rácio LTV Médio da Carteira" value="145% (Cobertura Total)" />
        <KpiCard icon={ShieldCheck} iconBg="bg-amber-50" iconColor="text-amber-600"
          label="Ativos em Avaliação Pericial" value={String(garantias.filter(g => g.statusAvaliacao !== 'APROVADA').length)} />
      </div>

      {/* Table */}
      <DataTable
        toolbar={
          <Toolbar
            search={search}
            onSearchChange={v => { setSearch(v); setCurrentPage(1) }}
            searchPlaceholder="Pesquisar por ID Solicitação, Tipo, Descrição..."
          >
            <FilterSelect
              value={statusFilter}
              onChange={v => { setStatusFilter(v); setCurrentPage(1) }}
              options={[
                { value: 'APROVADA', label: 'Aprovada' },
                { value: 'PENDENTE', label: 'Pendente' },
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
          headers={['Contrato Sol.', 'Tipo de Garantia', 'Descrição', 'Valor Declarado', 'Valor Avaliado', 'Estado', 'Ação']}
          loading={loading}
          empty={!loading && paginated.length === 0}
          emptyMessage="Nenhuma garantia associada localizada."
        >
          {paginated.map((g: Garantia) => (
            <tr key={g.id} className="hover:bg-zinc-50/60 transition-colors">
              <td className="px-4 py-3 font-mono font-semibold text-zinc-900">#SOL-{g.solicitacaoId}</td>
              <td className="px-4 py-3 text-xs font-semibold text-zinc-800 uppercase">{g.tipo.replace(/_/g, ' ')}</td>
              <td className="px-4 py-3 text-xs text-zinc-500 max-w-xs truncate">{g.descricao}</td>
              <td className="px-4 py-3"><KzValue value={g.valorEstimado} /></td>
              <td className="px-4 py-3"><KzValue value={g.valorAvaliado ?? g.valorEstimado} /></td>
              <td className="px-4 py-3"><StatusBadge status={g.statusAvaliacao || 'PENDENTE'} /></td>
              <td className="px-4 py-3 text-right">
                {g.statusAvaliacao !== 'APROVADA' ? (
                  <BtnPrimary onClick={() => { setSelectedForEval(g); setValorAvaliadoManual(g.valorEstimado) }}>
                    Avaliar
                  </BtnPrimary>
                ) : <span className="text-xs text-zinc-300">—</span>}
              </td>
            </tr>
          ))}
        </Table>
      </DataTable>

      {/* Modal Registar Garantia */}
      {showAddModal && (
        <Modal title="Registar Novo Colateral de Crédito" icon={PlusCircle} onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit} className="space-y-3.5">
            <FormField label="Cliente / Mutuário da Garantia">
              <ClientSearchSelect
                value={solicitacaoId ? Number(solicitacaoId) : null}
                onChange={clientId => setSolicitacaoId(clientId ? String(clientId) : '1')}
                placeholder="Pesquisar por Nome, NIF, Email..."
              />
            </FormField>

            <FormField label="Tipo de Garantia / Ativo">
              <select value={tipo} onChange={e => setTipo(e.target.value)} className={selectClass}>
                <option value="HIPOTECA_IMOVEL">Hipoteca Imobiliária</option>
                <option value="PENHOR_VEICULO">Penhor de Veículos / Frotas</option>
                <option value="EQUIPAMENTO_INDUSTRIAL">Maquinaria Industrial</option>
                <option value="FIANCA_BANCARIA">Fiança Bancária / Avalista</option>
                <option value="PENHOR_MERCADORIA">Penhor de Mercadorias / Stock</option>
              </select>
            </FormField>

            <FormField label="Descrição Detalhada do Bem" required>
              <textarea value={descricao} onChange={e => setDescricao(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-900 h-20 focus:outline-none focus:border-zinc-400 resize-none" required />
            </FormField>

            <FormField label="Valor Estimado do Mutuário (Kz)" required>
              <input type="number" value={valorEstimado} onChange={e => setValorEstimado(Number(e.target.value))}
                className={inputClass} required />
            </FormField>

            <ModalFooter onCancel={() => setShowAddModal(false)}>
              <BtnPrimary type="submit" loading={isSubmitting}>
                {isSubmitting ? 'A Gravar...' : 'Registar Garantia'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Modal Avaliação Pericial */}
      {selectedForEval && (
        <Modal title={`Avaliação Pericial — Bem #${selectedForEval.id}`} icon={Calculator} onClose={() => setSelectedForEval(null)}>
          <form onSubmit={handleAvaliarSubmit} className="space-y-3.5">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 text-xs text-zinc-600">
              <span className="font-semibold text-zinc-900">{selectedForEval.tipo}</span> — Valor Estimado:{' '}
              <KzValue value={selectedForEval.valorEstimado} />
            </div>

            <FormField label="Valor Avaliado Pericial (Kz)" required>
              <input type="number" value={valorAvaliadoManual} onChange={e => setValorAvaliadoManual(Number(e.target.value))}
                className={inputClass} required />
            </FormField>

            <FormField label="Parecer Pericial & Observações">
              <textarea value={parecerAvaliacao} onChange={e => setParecerAvaliacao(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-900 h-20 focus:outline-none focus:border-zinc-400 resize-none" />
            </FormField>

            <ModalFooter onCancel={() => setSelectedForEval(null)}>
              <BtnPrimary type="submit" loading={isSubmitting}>
                {isSubmitting ? 'A Gravar...' : 'Aprovar Peritagem'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </PageShell>
  )
}
