import {
  PageShell, PageHeader, KpiCard, DataTable, Table, StatusBadge,
  Toolbar, FilterSelect, BtnPrimary, Modal, ModalFooter,
  FormField, inputClass, selectClass, Toast, BtnRefresh, BtnNew, KzValue,
} from '../components/ui'
import { PaginationControl } from '../components/PaginationControl'
import { Briefcase, Users, TrendingUp, DollarSign, Plus } from 'lucide-react'
import { useRh } from '../hooks/useRh'

export function RecursosHumanos() {
  const {
    rhs, loading, search, setSearch, cargoFilter, setCargoFilter,
    currentPage, setCurrentPage, perPage, setPerPage, toast,
    showModal, setShowModal, nome, setNome, cargo, setCargo, salario, setSalario,
    departamento, setDepartamento, dataAdmissao, setDataAdmissao, status, setStatus,
    isSaving, handleSubmit, handleDelete, totalItems, totalPages, paginated, kpis, load,
  } = useRh()

  return (
    <PageShell>
      {toast && <Toast message={toast.msg} type={toast.type} />}

      <PageHeader
        icon={Briefcase}
        title="Recursos Humanos & Gestão de Pessoal"
        description="Administração de colaboradores, vencimentos, departamentos e folha de pagamento."
      >
        <BtnRefresh onClick={load} />
        <BtnNew onClick={() => setShowModal(true)} label="Novo Colaborador" />
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard icon={Users} iconBg="bg-zinc-100" iconColor="text-zinc-700"
          label="Total de Colaboradores" value={String(kpis.totalColaboradores || 0)} />
        <KpiCard icon={TrendingUp} iconBg="bg-emerald-50" iconColor="text-emerald-600"
          label="Colaboradores Ativos" value={String(kpis.ativos || 0)} />
        <KpiCard icon={DollarSign} iconBg="bg-amber-50" iconColor="text-amber-600"
          label="Massa Salarial Mensal"
          value={`Kz ${Number(kpis.massaSalarial || 0).toLocaleString('pt-AO')}`} />
        <KpiCard icon={Briefcase} iconBg="bg-zinc-100" iconColor="text-zinc-700"
          label="Média Salarial"
          value={`Kz ${Number(kpis.mediaSalarial || 0).toLocaleString('pt-AO')}`} />
      </div>

      {/* Table */}
      <DataTable
        toolbar={
          <Toolbar
            search={search}
            onSearchChange={v => { setSearch(v); setCurrentPage(1) }}
            searchPlaceholder="Pesquisar por Nome, Cargo ou Departamento..."
          >
            <FilterSelect
              value={cargoFilter}
              onChange={v => { setCargoFilter(v); setCurrentPage(1) }}
              options={[
                { value: 'DIRECTOR', label: 'Diretor' },
                { value: 'GESTOR', label: 'Gestor' },
                { value: 'ANALISTA', label: 'Analista' },
                { value: 'TECNICO', label: 'Técnico' },
                { value: 'ASSISTENTE', label: 'Assistente' },
              ]}
              placeholder="Todos os Cargos"
            />
          </Toolbar>
        }
        pagination={
          <PaginationControl
            currentPage={currentPage} totalPages={totalPages}
            totalItems={totalItems} perPage={perPage}
            onPageChange={setCurrentPage} onPerPageChange={p => { setPerPage(p); setCurrentPage(1) }}
          />
        }
      >
        <Table
          headers={['Nome Completo', 'Cargo', 'Departamento', 'Data Admissão', 'Salário Base (Kz)', 'Estado', 'Ações']}
          loading={loading}
          empty={!loading && paginated.length === 0}
          emptyMessage="Nenhum colaborador registado."
        >
          {paginated.map((rh: {id: number; nome: string; cargo: string; departamento: string; dataAdmissao: string; salario: number; status: string}) => (
            <tr key={rh.id} className="hover:bg-zinc-50/60 transition-colors">
              <td className="px-4 py-3 font-semibold text-zinc-900 text-xs">{rh.nome}</td>
              <td className="px-4 py-3 text-xs text-zinc-600 font-medium">{rh.cargo}</td>
              <td className="px-4 py-3 text-xs text-zinc-500">{rh.departamento}</td>
              <td className="px-4 py-3 text-xs font-mono text-zinc-400">
                {new Date(rh.dataAdmissao).toLocaleDateString('pt-AO')}
              </td>
              <td className="px-4 py-3"><KzValue value={rh.salario} /></td>
              <td className="px-4 py-3"><StatusBadge status={rh.status || 'ATIVO'} /></td>
              <td className="px-4 py-3 text-right">
                <button onClick={() => handleDelete(rh.id)}
                  className="text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer text-xs">
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </Table>
      </DataTable>

      {/* Modal Novo Colaborador */}
      {showModal && (
        <Modal title="Registar Novo Colaborador" icon={Plus} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <FormField label="Nome Completo" required>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)}
                placeholder="Ex: João António Silva" className={inputClass} required />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Cargo" required>
                <select value={cargo} onChange={e => setCargo(e.target.value)} className={selectClass}>
                  <option value="DIRECTOR">Diretor</option>
                  <option value="GESTOR">Gestor</option>
                  <option value="ANALISTA">Analista</option>
                  <option value="TECNICO">Técnico</option>
                  <option value="ASSISTENTE">Assistente</option>
                </select>
              </FormField>
              <FormField label="Departamento" required>
                <input type="text" value={departamento} onChange={e => setDepartamento(e.target.value)}
                  placeholder="Ex: Tecnologia" className={inputClass} required />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Data de Admissão" required>
                <input type="date" value={dataAdmissao} onChange={e => setDataAdmissao(e.target.value)}
                  className={inputClass} required />
              </FormField>
              <FormField label="Salário Base (Kz)" required>
                <input type="number" step="1000" value={salario} onChange={e => setSalario(Number(e.target.value))}
                  className={inputClass} required />
              </FormField>
            </div>

            <FormField label="Estado">
              <select value={status} onChange={e => setStatus(e.target.value)} className={selectClass}>
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="LICENCA">Em Licença</option>
              </select>
            </FormField>

            <ModalFooter onCancel={() => setShowModal(false)}>
              <BtnPrimary type="submit" loading={isSaving} icon={Plus}>
                {isSaving ? 'A Gravar...' : 'Registar Colaborador'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </PageShell>
  )
}