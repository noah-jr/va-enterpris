import {
  PageShell, PageHeader, KpiCard, DataTable, Table, StatusBadge,
  Toolbar, FilterSelect, BtnPrimary, BtnSecondary, BtnDanger, Modal, ModalFooter,
  FormField, inputClass, selectClass, KzValue, BtnNew, IconBtn,
} from '../components/ui'
import { PaginationControl } from '../components/PaginationControl'
import { ClientSearchSelect } from '../components/ClientSearchSelect'
import {
  FileSignature, DollarSign, ShieldCheck, AlertTriangle, Building, RefreshCw, ArrowRightLeft, Trash2, Plus
} from 'lucide-react'
import { useState } from 'react'
import { useContratos, type StatusContrato } from '../hooks/useContratos'

export function Contratos() {
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const {
    loading, search, setSearch, statusFilter, setStatusFilter, kpis,
    showModal, setShowModal, titulo, setTitulo, tipo, setTipo, setParteContratante,
    valorContrato, setValorContrato, dataInicio, setDataInicio, dataFim, setDataFim,
    status, setStatus, isSaving, selectedForRenew, setSelectedForRenew,
    valorAditivo, setValorAditivo, isRenewing, selectedForStatus, setSelectedForStatus,
    newStatus, setNewStatus, handleDelete, handleRenewSubmit, handleUpdateStatus,
    handleCreateSubmit, filtered,
  } = useContratos()

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  return (
    <PageShell>
      <PageHeader
        icon={FileSignature}
        title="Gestão de Contratos & Aditivos"
        description="Gestão do ciclo de vida, renovação de acordos, vigências e rescisões contratuais."
      >
        <BtnNew onClick={() => setShowModal(true)} label="Celebrar Novo Contrato" />
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard icon={DollarSign} iconBg="bg-zinc-100" iconColor="text-zinc-700"
          label="Valor da Carteira Ativa" value={`Kz ${Number(kpis.valorCarteiraContratos || 0).toLocaleString('pt-AO')}`}
          sub="Valor total sob vigência ativa" />
        <KpiCard icon={ShieldCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600"
          label="Contratos Ativos" value={String(kpis.contratosAtivos || 0)} sub="Vigentes e operacionais" />
        <KpiCard icon={AlertTriangle} iconBg="bg-rose-50" iconColor="text-rose-600"
          label="Contratos Expirados" value={String(kpis.contratosExpirados || 0)} sub="Requerem renovação" />
        <KpiCard icon={FileSignature} iconBg="bg-zinc-100" iconColor="text-zinc-700"
          label="Total de Acordos" value={String(kpis.totalContratos || 0)} sub="Instrumentos registados" />
      </div>

      {/* Table */}
      <DataTable
        toolbar={
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Pesquisar por Título do Contrato ou Contratante..."
          >
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'ATIVO', label: 'Vigente / Ativo' },
                { value: 'EXPIRADO', label: 'Expirado / Pendente' },
                { value: 'CANCELADO', label: 'Rescindido / Cancelado' },
              ]}
              placeholder="Todos os Estados"
            />
          </Toolbar>
        }
        pagination={
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={p => { setPerPage(p); setCurrentPage(1); }}
          />
        }
      >
        <Table
          headers={['Nº Contrato', 'Título do Instrumento', 'Parte Contratante', 'Valor Anual / Total', 'Estado', 'Ações']}
          loading={loading}
          empty={!loading && paginated.length === 0}
          emptyMessage="Nenhum contrato registado."
        >
          {paginated.map(c => (
            <tr key={c.id} className="hover:bg-zinc-50/60 transition-colors">
              <td className="px-4 py-3 font-mono font-semibold text-zinc-900">CTR-{c.id.toString().padStart(4, '0')}</td>
              <td className="px-4 py-3">
                <p className="font-semibold text-zinc-900 text-xs">{c.titulo || 'Contrato Empresarial'}</p>
                <p className="text-[10px] text-zinc-400">Tipo: {c.tipo || 'PRESTACAO_SERVICOS'}</p>
              </td>
              <td className="px-4 py-3 text-xs font-mono text-zinc-600">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-zinc-400" />
                  {c.parteContratante || 'Parte Externa'}
                </span>
              </td>
              <td className="px-4 py-3"><KzValue value={c.valorContrato || 0} /></td>
              <td className="px-4 py-3"><StatusBadge status={c.status || 'ATIVO'} /></td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <BtnSecondary onClick={() => setSelectedForRenew(c)} icon={RefreshCw}>Aditivo</BtnSecondary>
                  <IconBtn onClick={() => { setSelectedForStatus(c); setNewStatus(c.status || 'ATIVO') }} title="Transição de Estado" icon={ArrowRightLeft} />
                  <BtnDanger onClick={() => handleDelete(c.id)} icon={Trash2}>Rescindir</BtnDanger>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </DataTable>

      {/* Modal Aditivo / Renovação */}
      {selectedForRenew && (
        <Modal title="Aditivo & Renovação de Contrato" icon={RefreshCw} onClose={() => setSelectedForRenew(null)}>
          <form onSubmit={handleRenewSubmit} className="space-y-3.5">
            <p className="text-xs text-zinc-500">
              Adicionar aditivo orçamental para: <strong className="text-zinc-900">{selectedForRenew.titulo}</strong>
            </p>
            <FormField label="Valor do Aditivo Orçamental (Kz)" required>
              <input type="number" step="50000" value={valorAditivo} onChange={e => setValorAditivo(Number(e.target.value))}
                className={inputClass} required />
            </FormField>
            <ModalFooter onCancel={() => setSelectedForRenew(null)}>
              <BtnPrimary type="submit" loading={isRenewing}>
                {isRenewing ? 'A Processar...' : 'Confirmar Aditivo'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Modal Transição Estado */}
      {selectedForStatus && (
        <Modal title={`Transição de Estado — CTR-${selectedForStatus.id}`} icon={ArrowRightLeft} onClose={() => setSelectedForStatus(null)}>
          <div className="space-y-3.5">
            <FormField label="Situação Jurídica">
              <select value={newStatus} onChange={e => setNewStatus(e.target.value as StatusContrato)} className={selectClass}>
                <option value="ATIVO">Vigente / Ativo</option>
                <option value="EXPIRADO">Expirado / Aguarda Aditivo</option>
                <option value="CANCELADO">Rescindido / Suspenso</option>
              </select>
            </FormField>
            <ModalFooter onCancel={() => setSelectedForStatus(null)}>
              <BtnPrimary onClick={handleUpdateStatus}>Atualizar Estado</BtnPrimary>
            </ModalFooter>
          </div>
        </Modal>
      )}

      {/* Modal Celebrar Contrato */}
      {showModal && (
        <Modal title="Registar Instrumento Contratual" icon={FileSignature} onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreateSubmit} className="space-y-3.5">
            <FormField label="Título do Contrato" required>
              <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)}
                placeholder="Ex: Contrato de Fornecimento de Licenças" className={inputClass} required />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Parte Contratante (Cliente)">
                <ClientSearchSelect value={null} onChange={(_, client) => { if (client) setParteContratante(client.nome) }}
                  placeholder="Pesquisar Cliente / Entidade..." />
              </FormField>
              <FormField label="Tipo de Acordo">
                <select value={tipo} onChange={e => setTipo(e.target.value)} className={selectClass}>
                  <option value="PRESTACAO_SERVICOS">Prestação de Serviços</option>
                  <option value="ARRENDAMENTO">Arrendamento / Imóveis</option>
                  <option value="FORNECIMENTO">Fornecimento Continuado</option>
                  <option value="MANUTENCAO">Manutenção & SLA</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Valor do Contrato (Kz)" required>
                <input type="number" step="50000" value={valorContrato} onChange={e => setValorContrato(Number(e.target.value))}
                  className={inputClass} required />
              </FormField>
              <FormField label="Estado do Contrato">
                <select value={status} onChange={e => setStatus(e.target.value as StatusContrato)} className={selectClass}>
                  <option value="ATIVO">Vigente / Ativo</option>
                  <option value="EXPIRADO">Expirado</option>
                  <option value="CANCELADO">Rescindido</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Data de Início">
                <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className={inputClass} />
              </FormField>
              <FormField label="Data de Término">
                <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className={inputClass} />
              </FormField>
            </div>

            <ModalFooter onCancel={() => setShowModal(false)}>
              <BtnPrimary type="submit" loading={isSaving} icon={Plus}>
                {isSaving ? 'A Celebrar...' : 'Salvar Contrato'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </PageShell>
  )
}