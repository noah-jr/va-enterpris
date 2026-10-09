import {
  PageShell, PageHeader, KpiCard, DataTable, Table, StatusBadge,
  Toolbar, FilterSelect, BtnPrimary, BtnSecondary, BtnDanger, Modal, ModalFooter,
  FormField, inputClass, selectClass, KzValue, BtnNew, IconBtn,
} from '../components/ui'
import { PaginationControl } from '../components/PaginationControl'
import {
  Server, DollarSign, ShieldCheck, TrendingDown, MapPin, User, Wrench, ArrowRightLeft, Trash2, Plus
} from 'lucide-react'
import { useAtivos } from '../hooks/useAtivos'
import type { EstadoConservacao } from '../hooks/useAtivos'

export function Ativos() {
  const {
    loading, search, setSearch, catFilter, setCatFilter, currentPage, setCurrentPage,
    perPage, setPerPage, kpis, showModal, setShowModal, nome, setNome, categoria, setCategoria,
    localizacao, setLocalizacao, responsavel, setResponsavel, valor, setValor,
    estadoConservacao, setEstadoConservacao, taxaDepreciacaoAnual, setTaxaDepreciacaoAnual,
    isSaving, selectedForMaintenance, setSelectedForMaintenance, custoManutencao, setCustoManutencao,
    notasManutencao, setNotasManutencao, isSubmittingMaintenance, selectedForStatus, setSelectedForStatus,
    newEstado, setNewEstado, handleDelete, handleMaintenanceSubmit, handleUpdateStatus,
    handleCreateSubmit, totalItems, totalPages, paginated,
  } = useAtivos()

  return (
    <PageShell>
      <PageHeader
        icon={Server}
        title="Gestão de Ativos Fixos & Manutenções"
        description="Controlo de inventário imobilizado, mapa de manutenções, depreciação e baixas."
      >
        <BtnNew onClick={() => setShowModal(true)} label="Tombar Novo Ativo" />
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard icon={DollarSign} iconBg="bg-zinc-100" iconColor="text-zinc-700"
          label="Valor Patrimonial Total" value={`Kz ${Number(kpis.valorPatrimonialTotal || 0).toLocaleString('pt-AO')}`}
          sub="Ativo Bruto Imobilizado" />
        <KpiCard icon={ShieldCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600"
          label="Ativos Operacionais" value={String(kpis.ativosOperacionais || 0)} sub="Em pleno funcionamento" />
        <KpiCard icon={TrendingDown} iconBg="bg-amber-50" iconColor="text-amber-600"
          label="Depreciação Anual" value={`Kz ${Number(kpis.depreciacaoAnualEstimada || 0).toLocaleString('pt-AO')}`}
          sub="Amortização acumulada" />
        <KpiCard icon={Server} iconBg="bg-zinc-100" iconColor="text-zinc-700"
          label="Bens Tombados" value={String(kpis.totalAtivos || 0)} sub="Total de itens" />
      </div>

      {/* Table */}
      <DataTable
        toolbar={
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Pesquisar por Código PAT, Nome, Localização..."
          >
            <FilterSelect
              value={catFilter}
              onChange={setCatFilter}
              options={[
                { value: 'Equipamento Informático', label: 'Equipamento Informático' },
                { value: 'Veículos & Frota', label: 'Veículos & Frota' },
                { value: 'Imóveis & Instalações', label: 'Imóveis & Instalações' },
                { value: 'Maquinaria & Equipamentos', label: 'Maquinaria' },
                { value: 'Licenças & Software', label: 'Software' },
              ]}
              placeholder="Todas as Categorias"
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
          headers={['Património Nº', 'Nome do Bem', 'Localização & Fiel', 'Valor de Aquisição', 'Conservação', 'Ações']}
          loading={loading}
          empty={!loading && paginated.length === 0}
          emptyMessage="Nenhum bem patrimonial registado."
        >
          {paginated.map(a => (
            <tr key={a.id} className="hover:bg-zinc-50/60 transition-colors">
              <td className="px-4 py-3 font-mono font-semibold text-zinc-900">PAT-{a.id.toString().padStart(6, '0')}</td>
              <td className="px-4 py-3">
                <p className="font-semibold text-zinc-900 text-xs">{a.nome || 'Bem Imobilizado'}</p>
                <p className="text-[10px] text-zinc-400">Cat: {a.categoria || 'Equipamento'}</p>
              </td>
              <td className="px-4 py-3 text-xs">
                <p className="text-zinc-700 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-zinc-400" /> {a.localizacao || 'Sede'}
                </p>
                <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <User className="w-3 h-3 text-zinc-400" /> Fiel: {a.responsavel || 'Operações'}
                </p>
              </td>
              <td className="px-4 py-3"><KzValue value={a.valor || 0} /></td>
              <td className="px-4 py-3"><StatusBadge status={a.estadoConservacao || 'EXCELENTE'} /></td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <BtnSecondary onClick={() => setSelectedForMaintenance(a)} icon={Wrench}>Manutenção</BtnSecondary>
                  <IconBtn onClick={() => { setSelectedForStatus(a); setNewEstado(a.estadoConservacao || 'EXCELENTE') }} title="Reavaliação" icon={ArrowRightLeft} />
                  <BtnDanger onClick={() => handleDelete(a.id)} icon={Trash2}>Baixa</BtnDanger>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </DataTable>

      {/* Modal Manutenção */}
      {selectedForMaintenance && (
        <Modal title="Registar Manutenção de Ativo" icon={Wrench} onClose={() => setSelectedForMaintenance(null)}>
          <form onSubmit={handleMaintenanceSubmit} className="space-y-3.5">
            <p className="text-xs text-zinc-500">
              Ativo: <strong className="text-zinc-900">{selectedForMaintenance.nome}</strong> (PAT-{selectedForMaintenance.id})
            </p>
            <FormField label="Custo Estimado da Manutenção (Kz)" required>
              <input type="number" step="10000" value={custoManutencao} onChange={e => setCustoManutencao(Number(e.target.value))}
                className={inputClass} required />
            </FormField>
            <FormField label="Notas de Intervenção Técnica">
              <textarea rows={3} value={notasManutencao} onChange={e => setNotasManutencao(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 resize-none" />
            </FormField>
            <ModalFooter onCancel={() => setSelectedForMaintenance(null)}>
              <BtnPrimary type="submit" loading={isSubmittingMaintenance}>
                {isSubmittingMaintenance ? 'A Gravar...' : 'Confirmar Manutenção'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Modal Reavaliação Conservação */}
      {selectedForStatus && (
        <Modal title={`Reavaliação de Conservação — PAT-${selectedForStatus.id}`} icon={ArrowRightLeft} onClose={() => setSelectedForStatus(null)}>
          <div className="space-y-3.5">
            <FormField label="Estado de Conservação">
              <select value={newEstado} onChange={e => setNewEstado(e.target.value as EstadoConservacao)} className={selectClass}>
                <option value="EXCELENTE">Excelente Estado (Novo)</option>
                <option value="BOM">Bom Estado (Operacional)</option>
                <option value="REGULAR">Regular (Requer Revisão)</option>
                <option value="DANIFICADO">Danificado (Inoperacional)</option>
                <option value="ABATIDO">Abatido / Para Sucata</option>
              </select>
            </FormField>
            <ModalFooter onCancel={() => setSelectedForStatus(null)}>
              <BtnPrimary onClick={handleUpdateStatus}>Salvar Reavaliação</BtnPrimary>
            </ModalFooter>
          </div>
        </Modal>
      )}

      {/* Modal Tombar Ativo */}
      {showModal && (
        <Modal title="Tombar Bem Imobilizado (PAT)" icon={Server} onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreateSubmit} className="space-y-3.5">
            <FormField label="Designação do Ativo" required>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)}
                placeholder="Ex: Servidor Dell PowerEdge R750" className={inputClass} required />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Categoria do Bem">
                <select value={categoria} onChange={e => setCategoria(e.target.value)} className={selectClass}>
                  <option value="Equipamento Informático">Equipamento Informático</option>
                  <option value="Veículos & Frota">Veículos & Frota</option>
                  <option value="Imóveis & Instalações">Imóveis & Instalações</option>
                  <option value="Maquinaria & Equipamentos">Maquinaria & Equipamentos</option>
                  <option value="Licenças & Software">Licenças & Software</option>
                </select>
              </FormField>
              <FormField label="Localização Física" required>
                <input type="text" value={localizacao} onChange={e => setLocalizacao(e.target.value)}
                  placeholder="Ex: Datacenter A" className={inputClass} required />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Fiel Depositário">
                <input type="text" value={responsavel} onChange={e => setResponsavel(e.target.value)}
                  placeholder="Ex: Eng. Pedro Viana" className={inputClass} />
              </FormField>
              <FormField label="Estado de Conservação">
                <select value={estadoConservacao} onChange={e => setEstadoConservacao(e.target.value as EstadoConservacao)} className={selectClass}>
                  <option value="EXCELENTE">Excelente</option>
                  <option value="BOM">Bom</option>
                  <option value="REGULAR">Regular</option>
                  <option value="DANIFICADO">Danificado</option>
                  <option value="ABATIDO">Abatido</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Valor de Aquisição (Kz)" required>
                <input type="number" step="10000" value={valor} onChange={e => setValor(Number(e.target.value))}
                  className={inputClass} required />
              </FormField>
              <FormField label="Taxa Amortização Anual (%)" required>
                <input type="number" min="0" max="100" value={taxaDepreciacaoAnual} onChange={e => setTaxaDepreciacaoAnual(Number(e.target.value))}
                  className={inputClass} required />
              </FormField>
            </div>

            <ModalFooter onCancel={() => setShowModal(false)}>
              <BtnPrimary type="submit" loading={isSaving} icon={Plus}>
                {isSaving ? 'A Tombar...' : 'Salvar Ativo Fixo'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </PageShell>
  )
}