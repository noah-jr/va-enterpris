import {
  PageShell, PageHeader, KpiCard, DataTable, Table,
  Toolbar, FilterSelect, BtnPrimary, BtnSecondary, Modal, ModalFooter,
  FormField, inputClass, selectClass, KzValue, BtnNew, cn,
} from '../components/ui'
import { PaginationControl } from '../components/PaginationControl'
import {
  Calculator, Scale, DollarSign, BookOpen, RotateCcw, Trash2, ShieldCheck
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../api/client'

interface LancamentoContabil {
  id: number
  codigoConta: string | null
  conta: string
  descricao: string | null
  diario: string
  valor: number
  tipo: 'DEBITO' | 'CREDITO'
  exercicioFiscal: string
  createdAt: string
}

export function Contabilidade() {
  const [lancamentos, setLancamentos] = useState<LancamentoContabil[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [kpis, setKpis] = useState({ totalLancamentos: 0, totalDebito: 0, totalCredito: 0, balanceteVerificacao: 0 })
  const [showModal, setShowModal] = useState(false)
  const [codigoConta, setCodigoConta] = useState('12.1')
  const [conta, setConta] = useState('Depósitos à Ordem - BFA')
  const [descricao, setDescricao] = useState('')
  const [diario, setDiario] = useState('Diário Geral')
  const [valor, setValor] = useState(250000)
  const [tipo, setTipo] = useState<'DEBITO' | 'CREDITO'>('DEBITO')
  const [isSaving, setIsSaving] = useState(false)
  const [selectedForEstorno, setSelectedForEstorno] = useState<LancamentoContabil | null>(null)
  const [motivoEstorno, setMotivoEstorno] = useState('Correção de lançamento indevido / regularização de conta')

  useEffect(() => { loadData(); loadKpis() }, [])

  const loadData = () => {
    setLoading(true)
    api.get('/contabilidade')
      .then(res => {
        const p = res.data?.data ?? res.data
        setLancamentos(Array.isArray(p) ? p : (p?.data || []))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const loadKpis = () => {
    api.get('/contabilidade/kpis').then(res => { if (res.data) setKpis(res.data) }).catch(() => {})
  }

  const handleEstornoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedForEstorno) return
    try {
      await api.delete(`/contabilidade/${selectedForEstorno.id}`)
      setSelectedForEstorno(null)
      loadData(); loadKpis()
    } catch { alert('Erro ao estornar lançamento.') }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await api.post('/contabilidade', {
        codigo_conta: codigoConta, conta,
        descricao: descricao || 'Lançamento Contabilístico de Diário',
        diario, valor: Number(valor), tipo, exercicio_fiscal: '2026',
        criado_por: 'Contabilista Certificado Gloxis'
      })
      setShowModal(false); setDescricao(''); setValor(250000)
      loadData(); loadKpis()
    } catch { alert('Erro ao registar lançamento.') } finally { setIsSaving(false) }
  }

  const filtered = lancamentos.filter(l => {
    const matchSearch = String(l.id).includes(search) ||
      l.conta?.toLowerCase().includes(search.toLowerCase()) ||
      l.descricao?.toLowerCase().includes(search.toLowerCase())
    const matchTipo = !tipoFilter || l.tipo === tipoFilter
    return matchSearch && matchTipo
  })

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  return (
    <PageShell>
      <PageHeader
        icon={Calculator}
        title="Contabilidade Geral & Gestão do PGC"
        description="Plano Geral de Contas (PGC), balancetes de verificação, diários, estornos e encerramento de exercício."
      >
        <BtnSecondary onClick={() => window.confirm('Iniciar encerramento do Exercício Fiscal 2026?')} icon={ShieldCheck}>
          Fecho de Exercício
        </BtnSecondary>
        <BtnNew onClick={() => setShowModal(true)} label="Novo Lançamento" />
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard icon={Scale} iconBg="bg-emerald-50" iconColor="text-emerald-600"
          label="Equilíbrio (Débito - Crédito)"
          value={`Kz ${Number(kpis.balanceteVerificacao || 0).toLocaleString('pt-AO')}`}
          sub="Balancete auditado e equilibrado" />
        <KpiCard icon={DollarSign} iconBg="bg-rose-50" iconColor="text-rose-600"
          label="Total Movimentado Débito"
          value={`Kz ${Number(kpis.totalDebito || 0).toLocaleString('pt-AO')}`}
          sub="Partidas lançadas a Débito" />
        <KpiCard icon={DollarSign} iconBg="bg-blue-50" iconColor="text-blue-600"
          label="Total Movimentado Crédito"
          value={`Kz ${Number(kpis.totalCredito || 0).toLocaleString('pt-AO')}`}
          sub="Partidas lançadas a Crédito" />
        <KpiCard icon={BookOpen} iconBg="bg-zinc-100" iconColor="text-zinc-700"
          label="Total de Lançamentos" value={String(kpis.totalLancamentos || 0)}
          sub="Registos no Diário de Contabilidade" />
      </div>

      {/* Table */}
      <DataTable
        toolbar={
          <Toolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Pesquisar por Código de Conta, Nome ou Histórico..."
          >
            <FilterSelect
              value={tipoFilter}
              onChange={setTipoFilter}
              options={[
                { value: 'DEBITO', label: 'DÉBITO (Aplicação de Fundos)' },
                { value: 'CREDITO', label: 'CRÉDITO (Origem de Fundos)' },
              ]}
              placeholder="Todas as Naturezas"
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
          headers={['Lançamento ID', 'Conta PGC', 'Descrição / Histórico', 'Diário', 'Natureza', 'Valor Total', 'Ações']}
          loading={loading}
          empty={!loading && paginated.length === 0}
          emptyMessage="Nenhum lançamento contabilístico encontrado."
        >
          {paginated.map(l => (
            <tr key={l.id} className="hover:bg-zinc-50/60 transition-colors">
              <td className="px-4 py-3 font-mono font-semibold text-zinc-900">LD-{l.id.toString().padStart(6, '0')}</td>
              <td className="px-4 py-3">
                <p className="font-mono font-semibold text-zinc-900 text-xs">{l.codigoConta || '11.1'}</p>
                <p className="text-zinc-500 text-[11px]">{l.conta}</p>
              </td>
              <td className="px-4 py-3 text-xs text-zinc-600">{l.descricao || 'Histórico do Lançamento'}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700">
                  {l.diario || 'Diário Geral'}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  'px-2 py-0.5 text-[10px] font-semibold rounded-full border',
                  l.tipo === 'DEBITO' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                )}>
                  {l.tipo === 'DEBITO' ? 'DÉBITO (D)' : 'CRÉDITO (C)'}
                </span>
              </td>
              <td className="px-4 py-3"><KzValue value={l.valor} /></td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <BtnSecondary onClick={() => setSelectedForEstorno(l)} icon={RotateCcw}>Estorno</BtnSecondary>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </DataTable>

      {/* Modal Estorno */}
      {selectedForEstorno && (
        <Modal title={`Estorno do Lançamento LD-${selectedForEstorno.id}`} icon={RotateCcw} onClose={() => setSelectedForEstorno(null)}>
          <form onSubmit={handleEstornoSubmit} className="space-y-3.5">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
              Conta: <span className="font-semibold text-zinc-900">{selectedForEstorno.conta}</span> —{' '}
              <KzValue value={selectedForEstorno.valor} />
            </div>
            <FormField label="Motivo do Estorno / Regularização" required>
              <textarea rows={3} value={motivoEstorno} onChange={e => setMotivoEstorno(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 resize-none" required />
            </FormField>
            <ModalFooter onCancel={() => setSelectedForEstorno(null)}>
              <BtnPrimary type="submit" icon={Trash2}>Confirmar Estorno</BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Modal Novo Lançamento */}
      {showModal && (
        <Modal title="Registar Lançamento Contabilístico (PGC)" icon={Calculator} onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreateSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Código da Conta PGC" required>
                <input type="text" value={codigoConta} onChange={e => setCodigoConta(e.target.value)}
                  placeholder="Ex: 12.1 ou 31.1" className={inputClass} required />
              </FormField>
              <FormField label="Natureza da Partida">
                <div className="grid grid-cols-2 gap-2">
                  {(['DEBITO', 'CREDITO'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setTipo(t)}
                      className={cn('py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer',
                        tipo === t && t === 'DEBITO' ? 'bg-rose-50 border-rose-300 text-rose-700' :
                        tipo === t ? 'bg-blue-50 border-blue-300 text-blue-700' :
                        'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                      )}>
                      {t === 'DEBITO' ? 'DÉBITO (D)' : 'CRÉDITO (C)'}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>

            <FormField label="Nome da Conta PGC" required>
              <input type="text" value={conta} onChange={e => setConta(e.target.value)}
                placeholder="Ex: Depósitos à Ordem - Banco BFA" className={inputClass} required />
            </FormField>

            <FormField label="Descrição / Histórico" required>
              <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)}
                placeholder="Ex: Pagamento de faturas de fornecedor via transferência" className={inputClass} required />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Diário Contabilístico">
                <select value={diario} onChange={e => setDiario(e.target.value)} className={selectClass}>
                  <option>Diário Geral</option>
                  <option>Diário de Bancos</option>
                  <option>Diário de Caixas</option>
                  <option>Diário de Vendas</option>
                  <option>Diário de Compras</option>
                </select>
              </FormField>
              <FormField label="Valor Total (Kz)" required>
                <input type="number" step="100" value={valor} onChange={e => setValor(Number(e.target.value))}
                  className={inputClass} required />
              </FormField>
            </div>

            <ModalFooter onCancel={() => setShowModal(false)}>
              <BtnPrimary type="submit" loading={isSaving}>
                {isSaving ? 'A Gravar...' : 'Salvar no Diário'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </PageShell>
  )
}