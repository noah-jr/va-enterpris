import {
  PageShell, PageHeader, KpiCard, DataTable, Table, StatusBadge,
  Toolbar, FilterSelect, BtnPrimary, BtnSecondary, BtnDanger, Modal, ModalFooter,
  FormField, inputClass, selectClass, KzValue, BtnNew,
} from '../components/ui'
import { PaginationControl } from '../components/PaginationControl'
import { ClientSearchSelect } from '../components/ClientSearchSelect'
import {
  FolderKanban, DollarSign, Clock, CheckCircle2, UserCheck, Sliders, Trash2, Plus
} from 'lucide-react'
import { useState } from 'react'
import { useProjetos } from '../hooks/useProjetos'
import type { StatusProjeto } from '../hooks/useProjetos'

export function Projetos() {
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const {
    loading, search, setSearch, statusFilter, setStatusFilter, kpis,
    showModal, setShowModal, nome, setNome, gerenteProjeto, setGerenteProjeto,
    setClienteNome, orcamento, setOrcamento, progressoPercentual, setProgressoPercentual,
    status, setStatus, dataInicio, setDataInicio, dataPrevistaFim, setDataPrevistaFim,
    isSaving, selectedForProgress, setSelectedForProgress, newProgresso, setNewProgresso,
    newStatus, setNewStatus, isUpdatingProgress, handleDelete, handleUpdateProgressSubmit,
    handleCreateSubmit, filtered,
  } = useProjetos()

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  return (
    <PageShell>
      <PageHeader
        icon={FolderKanban}
        title="Gestão de Projetos & Progresso"
        description="Planeamento, execução de fases, controlo de progresso percentual e verbas."
      >
        <BtnNew onClick={() => setShowModal(true)} label="Criar Novo Projeto" />
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard icon={DollarSign} iconBg="bg-zinc-100" iconColor="text-zinc-700"
          label="Orçamento Total Alocado" value={`Kz ${Number(kpis.orcamentoTotalGeral || 0).toLocaleString('pt-AO')}`}
          sub="Valor cabimentado" />
        <KpiCard icon={Clock} iconBg="bg-blue-50" iconColor="text-blue-600"
          label="Em Andamento" value={String(kpis.projetosEmAndamento || 0)} sub="Em fase de execução" />
        <KpiCard icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600"
          label="Concluídos" value={String(kpis.projetosConcluidos || 0)} sub="Entregues e encerrados" />
        <KpiCard icon={FolderKanban} iconBg="bg-amber-50" iconColor="text-amber-600"
          label="Total de Projetos" value={String(kpis.totalProjetos || 0)} sub="Portfólio global" />
      </div>

      {/* Table */}
      <DataTable
        toolbar={
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Pesquisar por Nome do Projeto, Gerente ou Cliente..."
          >
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
                { value: 'PLANEAMENTO', label: 'Planeamento' },
                { value: 'CONCLUIDO', label: 'Concluído' },
                { value: 'CANCELADO', label: 'Cancelado' },
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
          headers={['Nº Projeto', 'Nome do Projeto', 'Gerente & Cliente', 'Orçamento', 'Progresso', 'Estado', 'Ações']}
          loading={loading}
          empty={!loading && paginated.length === 0}
          emptyMessage="Nenhum projeto encontrado."
        >
          {paginated.map(p => {
            const prog = Number(p.progressoPercentual || 0)
            return (
              <tr key={p.id} className="hover:bg-zinc-50/60 transition-colors">
                <td className="px-4 py-3 font-mono font-semibold text-zinc-900">PRJ-{p.id.toString().padStart(4, '0')}</td>
                <td className="px-4 py-3 font-semibold text-zinc-900 text-xs">{p.nome || 'Projeto Empresarial'}</td>
                <td className="px-4 py-3">
                  <p className="text-xs font-semibold text-zinc-800 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-zinc-500" /> {p.gerenteProjeto || 'Gestor Gloxis'}
                  </p>
                  <p className="text-[10px] text-zinc-400">Cliente: {p.clienteNome || 'Cliente Interno'}</p>
                </td>
                <td className="px-4 py-3"><KzValue value={p.orcamento || 0} /></td>
                <td className="px-4 py-3">
                  <div className="w-28 space-y-1">
                    <div className="text-[10px] font-semibold text-zinc-700">{prog}%</div>
                    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-900 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, prog))}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><StatusBadge status={p.status || 'EM_ANDAMENTO'} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <BtnSecondary onClick={() => { setSelectedForProgress(p); setNewProgresso(prog); setNewStatus(p.status || 'EM_ANDAMENTO') }} icon={Sliders}>
                      Progresso
                    </BtnSecondary>
                    <BtnDanger onClick={() => handleDelete(p.id)} icon={Trash2}>Cancelar</BtnDanger>
                  </div>
                </td>
              </tr>
            )
          })}
        </Table>
      </DataTable>

      {/* Modal Progresso */}
      {selectedForProgress && (
        <Modal title="Controlo de Progresso do Projeto" icon={Sliders} onClose={() => setSelectedForProgress(null)}>
          <form onSubmit={handleUpdateProgressSubmit} className="space-y-3.5">
            <p className="text-xs text-zinc-500">
              Projeto: <strong className="text-zinc-900">{selectedForProgress.nome}</strong>
            </p>
            <FormField label={`Progresso Percentual (${newProgresso}%)`}>
              <input type="range" min="0" max="100" value={newProgresso}
                onChange={e => {
                  const val = Number(e.target.value)
                  setNewProgresso(val)
                  if (val === 100) setNewStatus('CONCLUIDO')
                  else if (val > 0 && newStatus === 'PLANEAMENTO') setNewStatus('EM_ANDAMENTO')
                }}
                className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900" />
            </FormField>

            <FormField label="Fase / Estado Atual">
              <select value={newStatus} onChange={e => setNewStatus(e.target.value as StatusProjeto)} className={selectClass}>
                <option value="PLANEAMENTO">Planeamento Inicial</option>
                <option value="EM_ANDAMENTO">Em Execução / Andamento</option>
                <option value="CONCLUIDO">Concluído & Entregue</option>
                <option value="CANCELADO">Suspenso / Cancelado</option>
              </select>
            </FormField>

            <ModalFooter onCancel={() => setSelectedForProgress(null)}>
              <BtnPrimary type="submit" loading={isUpdatingProgress}>
                {isUpdatingProgress ? 'A Gravar...' : 'Salvar Progresso'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Modal Criar Projeto */}
      {showModal && (
        <Modal title="Registar Novo Projeto" icon={FolderKanban} onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreateSubmit} className="space-y-3.5">
            <FormField label="Nome do Projeto" required>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)}
                placeholder="Ex: Expansão da Infraestrutura" className={inputClass} required />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Gerente de Projeto" required>
                <input type="text" value={gerenteProjeto} onChange={e => setGerenteProjeto(e.target.value)}
                  placeholder="Ex: Eng. Manuel Santos" className={inputClass} required />
              </FormField>
              <FormField label="Cliente / Entidade">
                <ClientSearchSelect value={null} onChange={(_, client) => { if (client) setClienteNome(client.nome) }}
                  placeholder="Pesquisar Cliente..." />
              </FormField>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FormField label="Orçamento (Kz)" required>
                <input type="number" step="100000" value={orcamento} onChange={e => setOrcamento(Number(e.target.value))}
                  className={inputClass} required />
              </FormField>
              <FormField label="Progresso (%)">
                <input type="number" min="0" max="100" value={progressoPercentual} onChange={e => setProgressoPercentual(Number(e.target.value))}
                  className={inputClass} />
              </FormField>
              <FormField label="Estado">
                <select value={status} onChange={e => setStatus(e.target.value as StatusProjeto)} className={selectClass}>
                  <option value="PLANEAMENTO">Planeamento</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="CONCLUIDO">Concluído</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Data de Início">
                <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className={inputClass} />
              </FormField>
              <FormField label="Previsão Término">
                <input type="date" value={dataPrevistaFim} onChange={e => setDataPrevistaFim(e.target.value)} className={inputClass} />
              </FormField>
            </div>

            <ModalFooter onCancel={() => setShowModal(false)}>
              <BtnPrimary type="submit" loading={isSaving} icon={Plus}>
                {isSaving ? 'A Registar...' : 'Salvar Projeto'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </PageShell>
  )
}