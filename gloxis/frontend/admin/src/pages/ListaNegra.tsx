import {
  PageShell, PageHeader, KpiCard, DataTable, Table, StatusBadge,
  Toolbar, FilterSelect, BtnPrimary, Modal, ModalFooter,
  FormField, inputClass, Toast, KzValue, BtnRefresh, BtnNew, BtnDanger,
} from '../components/ui'
import { PaginationControl } from '../components/PaginationControl'
import { ClientSearchSelect } from '../components/ClientSearchSelect'
import { AlertOctagon, ShieldOff, UserX, Lock, PlusCircle, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { api } from '../api/client'

interface ListaNegraItem {
  id: number
  clienteId: number
  motivo: string
  categoria?: string
  dataInclusao: string
  ativo: boolean
  cliente?: { id: number; nome: string; nif: string; email?: string }
}

export function ListaNegra() {
  const [itens, setItens] = useState<ListaNegraItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage] = useState(10)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<{ id: number } | null>(null)
  const [motivo, setMotivo] = useState('')
  const [categoria, setCategoria] = useState('INADIMPLENCIA')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const load = () => {
    setLoading(true)
    api.get('/lista-negra')
      .then(res => {
        const payload = res.data?.data || res.data
        setItens(Array.isArray(payload) ? payload : (payload?.data || []))
      })
      .catch(() => setItens([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRemover = async (id: number) => {
    if (!window.confirm('Confirmar remoção da Lista Negra BNA?')) return
    try {
      await api.delete(`/lista-negra/${id}`)
      showToast('Registo removido da Lista Negra com sucesso.', 'success')
      load()
    } catch {
      showToast('Erro ao remover registo.', 'error')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCliente) { showToast('Selecione um cliente.', 'error'); return }
    setIsSubmitting(true)
    try {
      await api.post('/lista-negra', { clienteId: selectedCliente.id, motivo, categoria })
      showToast('Cliente incluído na Lista Negra BNA.', 'success')
      setShowModal(false)
      setMotivo('')
      load()
    } catch {
      showToast('Erro ao incluir na Lista Negra.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = itens.filter(i => {
    const matchSearch = i.cliente?.nome?.toLowerCase().includes(search.toLowerCase()) ||
      i.cliente?.nif?.includes(search) || i.motivo.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCategoria || i.categoria === filterCategoria
    return matchSearch && matchCat
  })
  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)
  const ativos = itens.filter(i => i.ativo).length

  return (
    <PageShell>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <PageHeader
        icon={AlertOctagon}
        title="Lista Negra BNA"
        description="Gestão de clientes restringidos, incidentes de crédito e restrições regulatórias BNA."
      >
        <BtnRefresh onClick={load} />
        <BtnNew onClick={() => setShowModal(true)} label="Incluir na Lista" />
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <KpiCard icon={AlertOctagon} iconBg="bg-rose-50" iconColor="text-rose-600"
          label="Registos Ativos na Lista" value={String(ativos)} />
        <KpiCard icon={UserX} iconBg="bg-zinc-100" iconColor="text-zinc-700"
          label="Total de Incidentes" value={String(itens.length)} />
        <KpiCard icon={Lock} iconBg="bg-amber-50" iconColor="text-amber-600"
          label="Taxa de Incidência" value={itens.length ? `${((ativos / itens.length) * 100).toFixed(1)}%` : '0%'} />
      </div>

      {/* Table */}
      <DataTable
        toolbar={
          <Toolbar
            search={search}
            onSearchChange={v => { setSearch(v); setCurrentPage(1) }}
            searchPlaceholder="Pesquisar por Nome, NIF, Motivo..."
          >
            <FilterSelect
              value={filterCategoria}
              onChange={v => { setFilterCategoria(v); setCurrentPage(1) }}
              options={[
                { value: 'INADIMPLENCIA', label: 'Inadimplência' },
                { value: 'FRAUDE', label: 'Fraude' },
                { value: 'JUDICIAL', label: 'Judicial' },
                { value: 'OUTRO', label: 'Outro' },
              ]}
              placeholder="Todas as Categorias"
            />
          </Toolbar>
        }
        pagination={
          <PaginationControl
            currentPage={currentPage} totalPages={totalPages}
            totalItems={totalItems} perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={() => {}}
          />
        }
      >
        <Table
          headers={['Cliente', 'NIF', 'Motivo da Restrição', 'Categoria', 'Data Inclusão', 'Estado', 'Ação']}
          loading={loading}
          empty={!loading && paginated.length === 0}
          emptyMessage="Nenhum registo de restrição localizado."
        >
          {paginated.map(item => (
            <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
              <td className="px-4 py-3 font-semibold text-zinc-900 text-xs">
                {item.cliente?.nome || `Cliente #${item.clienteId}`}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-500">{item.cliente?.nif || '—'}</td>
              <td className="px-4 py-3 text-xs text-zinc-600 max-w-xs truncate">{item.motivo}</td>
              <td className="px-4 py-3 text-xs">
                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-full text-[10px] font-semibold">
                  {item.categoria || 'INADIMPLENCIA'}
                </span>
              </td>
              <td className="px-4 py-3 text-xs font-mono text-zinc-400">
                {new Date(item.dataInclusao).toLocaleDateString('pt-AO')}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={item.ativo ? 'ATIVO' : 'INATIVO'} />
              </td>
              <td className="px-4 py-3 text-right">
                <BtnDanger onClick={() => handleRemover(item.id)} icon={Trash2}>
                  Remover
                </BtnDanger>
              </td>
            </tr>
          ))}
        </Table>
      </DataTable>

      {/* Modal Incluir */}
      {showModal && (
        <Modal title="Incluir Cliente na Lista Negra BNA" icon={ShieldOff} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <FormField label="Cliente" required>
              <ClientSearchSelect
                value={selectedCliente?.id ?? null}
                onChange={c => setSelectedCliente(c)}
                placeholder="Pesquisar por Nome, NIF..."
              />
            </FormField>

            <FormField label="Categoria do Incidente" required>
              <select value={categoria} onChange={e => setCategoria(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400">
                <option value="INADIMPLENCIA">Inadimplência Crónica</option>
                <option value="FRAUDE">Fraude Documentar / Identidade</option>
                <option value="JUDICIAL">Processo Judicial Ativo</option>
                <option value="OUTRO">Outro Motivo Regulatório</option>
              </select>
            </FormField>

            <FormField label="Motivo Detalhado" required>
              <textarea value={motivo} onChange={e => setMotivo(e.target.value)}
                placeholder="Descreva o motivo da inclusão na lista..."
                className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-900 h-20 focus:outline-none focus:border-zinc-400 resize-none" required />
            </FormField>

            <ModalFooter onCancel={() => setShowModal(false)}>
              <BtnPrimary type="submit" loading={isSubmitting} icon={PlusCircle}>
                {isSubmitting ? 'A Incluir...' : 'Incluir na Lista'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </PageShell>
  )
}
