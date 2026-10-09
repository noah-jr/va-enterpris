import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { api } from '../api/client'
import { Avatar } from '../components/Avatar'
import { PaginationControl } from '../components/PaginationControl'
import {
  PageShell, PageHeader, KpiCard, DataTable, Table, StatusBadge,
  Toolbar, FilterSelect, BtnPrimary, BtnSecondary, Modal, ModalFooter,
  FormField, inputClass, BtnNew, Toast, IconBtn, BtnRefresh
} from '../components/ui'
import {
  Users, TrendingUp, AlertTriangle, ShieldCheck, PlusCircle,
  Eye, FileText, Download, UserPlus, CreditCard
} from 'lucide-react'

interface Cliente {
  id: number
  nome: string
  nif: string
  email?: string
  telefone?: string
  endereco?: string
  contaBancaria?: string
  fotografia?: string
  logotipo?: string
  scoreCredito: number
  risco: 'BAIXO' | 'MEDIO' | 'ALTO'
  isOnline?: boolean
  createdAt: string
  created_at: string
  creditos?: unknown[]
  faturas?: unknown[]
}

export function Clientes() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisco, setFilterRisco] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [perPage, setPerPage] = useState(10)

  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<{
    nome: string; nif: string; email: string; telefone: string;
    endereco: string; contaBancaria: string;
    fotografiaFile?: File; logotipoFile?: File;
  }>({ nome: '', nif: '', email: '', telefone: '', endereco: '', contaBancaria: '' })

  const [kpis, setKpis] = useState({ totalClientes: 0, crescimentoMensal: '0.0', riscoAlto: 0, online: 0 })
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const [selectedForCredit, setSelectedForCredit] = useState<Cliente | null>(null)
  const [creditValor, setCreditValor] = useState(2500000)
  const [creditParcelas, setCreditParcelas] = useState(12)
  const [creditFinalidade, setCreditFinalidade] = useState('Financiamento de Equipamento / Capital de Giro')
  const [isSubmittingCredit, setIsSubmittingCredit] = useState(false)

  const [selectedForRisk, setSelectedForRisk] = useState<Cliente | null>(null)
  const [newScore, setNewScore] = useState(750)
  const [newRisco, setNewRisco] = useState<'BAIXO' | 'MEDIO' | 'ALTO'>('BAIXO')
  const [isSubmittingRisk, setIsSubmittingRisk] = useState(false)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchClientes = (page = 1) => {
    setLoading(true)
    api.get('/clientes', {
      params: { page, limit: perPage, search: searchTerm, risco: filterRisco }
    })
      .then(res => {
        const payload = res.data
        if (payload && payload.meta) {
          setClientes(payload.data || [])
          setTotalPages(payload.meta.lastPage || 1)
          setTotalItems(payload.meta.total || 0)
          const allData = payload.data || []
          const alto = allData.filter((c: Cliente) => c.risco === 'ALTO').length
          const on = allData.filter((c: Cliente) => c.isOnline).length
          setKpis({ totalClientes: payload.meta.total, crescimentoMensal: '+4.2%', riscoAlto: alto, online: on })
        } else if (Array.isArray(payload)) {
          setClientes(payload)
          setTotalPages(1)
          setTotalItems(payload.length)
          const alto = payload.filter(c => c.risco === 'ALTO').length
          setKpis({ totalClientes: payload.length, crescimentoMensal: '+2.1%', riscoAlto: alto, online: 0 })
        } else {
          setClientes([])
        }
      })
      .catch(() => showToast('Erro ao carregar clientes.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchClientes(currentPage)
  }, [currentPage, perPage, searchTerm, filterRisco])

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = new FormData()
      data.append('nome', formData.nome)
      data.append('nif', formData.nif)
      if (formData.email) data.append('email', formData.email)
      if (formData.telefone) data.append('telefone', formData.telefone)
      if (formData.endereco) data.append('endereco', formData.endereco)
      if (formData.contaBancaria) data.append('contaBancaria', formData.contaBancaria)
      if (formData.fotografiaFile) data.append('fotografia', formData.fotografiaFile)
      if (formData.logotipoFile) data.append('logotipo', formData.logotipoFile)

      await api.post('/clientes', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      showToast('Cliente registado com sucesso!')
      setIsCreating(false)
      setFormData({ nome: '', nif: '', email: '', telefone: '', endereco: '', contaBancaria: '' })
      fetchClientes(1)
    } catch {
      showToast('Erro ao criar cliente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCreditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedForCredit) return
    setIsSubmittingCredit(true)
    try {
      await api.post('/operacoes/solicitacoes', {
        clienteId: selectedForCredit.id,
        valor: creditValor,
        numParcelas: creditParcelas,
        finalidade: creditFinalidade,
        taxaJuro: 3.5,
      })
      showToast('Solicitação de microcrédito submetida!')
      setSelectedForCredit(null)
      fetchClientes(currentPage)
    } catch {
      showToast('Erro ao submeter crédito.', 'error')
    } finally {
      setIsSubmittingCredit(false)
    }
  }

  const handleUpdateRiskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedForRisk) return
    setIsSubmittingRisk(true)
    try {
      await api.put(`/clientes/${selectedForRisk.id}`, { scoreCredito: newScore, risco: newRisco })
      showToast('Score e classificação de risco atualizados!')
      setSelectedForRisk(null)
      fetchClientes(currentPage)
    } catch {
      showToast('Erro ao atualizar risco.', 'error')
    } finally {
      setIsSubmittingRisk(false)
    }
  }

  return (
    <PageShell>
      {toast && <Toast message={toast.msg} type={toast.type} />}

      <PageHeader
        icon={Users}
        title="Gestão de Clientes & Mutuários"
        description="Base centralizada de clientes CRM, perfil de scoring financeiro e operações de crédito."
      >
        <BtnRefresh onClick={() => fetchClientes(currentPage)} loading={loading} />
        <BtnNew onClick={() => setIsCreating(true)} label="Registar Cliente" />
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard icon={Users} iconBg="bg-zinc-100" iconColor="text-zinc-700"
          label="Total de Clientes" value={String(totalItems || kpis.totalClientes)} sub="Base ativa registada" />
        <KpiCard icon={TrendingUp} iconBg="bg-emerald-50" iconColor="text-emerald-600"
          label="Crescimento" value={kpis.crescimentoMensal} sub="Novos registos no mês" />
        <KpiCard icon={AlertTriangle} iconBg="bg-rose-50" iconColor="text-rose-600"
          label="Risco Alto" value={String(kpis.riscoAlto)} sub="Monitorização contínua" />
        <KpiCard icon={ShieldCheck} iconBg="bg-teal-50" iconColor="text-teal-600"
          label="Ativos no Portal" value={String(kpis.online)} sub="Sessões web / app ativas" />
      </div>

      {/* Table */}
      <DataTable
        toolbar={
          <Toolbar
            search={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Pesquisar por Nome, NIF, Email..."
          >
            <FilterSelect
              value={filterRisco}
              onChange={setFilterRisco}
              options={[
                { value: 'BAIXO', label: 'Risco Baixo' },
                { value: 'MEDIO', label: 'Risco Médio' },
                { value: 'ALTO', label: 'Risco Alto' },
              ]}
              placeholder="Todos os Perfis de Risco"
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
          headers={['Cliente / Empresa', 'NIF / Documento', 'Contactos', 'Score / Risco', 'Data Registo', 'Ações']}
          loading={loading}
          empty={!loading && clientes.length === 0}
          emptyMessage="Nenhum cliente localizado na base de dados."
        >
          {clientes.map(c => (
            <tr key={c.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer" onClick={() => navigate(`/clientes/${c.id}`)}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Avatar name={c.nome} image={c.fotografia} size="sm" />
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white text-xs">{c.nome}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">ID #{c.id}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-xs font-mono text-zinc-800 dark:text-zinc-200 font-semibold">{c.nif}</td>
              <td className="px-4 py-3">
                <p className="text-xs text-zinc-700 dark:text-zinc-300">{c.email || 'Sem email'}</p>
                {c.telefone && <p className="text-[10px] text-zinc-400 font-mono">{c.telefone}</p>}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">{c.scoreCredito || 650} pts</span>
                  <StatusBadge status={c.risco || 'BAIXO'} />
                </div>
              </td>
              <td className="px-4 py-3 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                {c.createdAt || c.created_at ? new Date(c.createdAt || c.created_at).toLocaleDateString('pt-AO') : '-'}
              </td>
              <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1.5">
                  <IconBtn onClick={() => navigate(`/clientes/${c.id}`)} title="Ver Detalhes do Cliente" icon={Eye} />
                  <IconBtn onClick={() => { setSelectedForCredit(c) }} title="Submeter Solicitação de Crédito" icon={PlusCircle} />
                  <IconBtn onClick={() => { setSelectedForRisk(c); setNewScore(c.scoreCredito || 750); setNewRisco(c.risco || 'BAIXO') }} title="Reavaliar Score / Risco" icon={ShieldCheck} />
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </DataTable>

      {/* Modal Criar Cliente */}
      {isCreating && (
        <Modal title="Novo Cliente / Mutuário" icon={UserPlus} onClose={() => setIsCreating(false)}>
          <form onSubmit={handleCreateSubmit} className="space-y-3.5">
            <FormField label="Nome Completo / Firma Social" required>
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
            <FormField label="Endereço Residencial / Sede">
              <input type="text" value={formData.endereco} onChange={e => setFormData({ ...formData, endereco: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="IBAN / Conta Bancária">
              <input type="text" value={formData.contaBancaria} onChange={e => setFormData({ ...formData, contaBancaria: e.target.value })} className={inputClass} />
            </FormField>
            <ModalFooter onCancel={() => setIsCreating(false)}>
              <BtnPrimary type="submit" loading={loading} icon={UserPlus}>
                Gravar Cliente
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Modal Submeter Crédito */}
      {selectedForCredit && (
        <Modal title={`Novo Microcrédito — ${selectedForCredit.nome}`} icon={CreditCard} onClose={() => setSelectedForCredit(null)}>
          <form onSubmit={handleCreateCreditSubmit} className="space-y-3.5">
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1 text-xs">
              <p className="text-zinc-500">Mutuário: <strong className="text-zinc-900">{selectedForCredit.nome}</strong> (NIF: {selectedForCredit.nif})</p>
              <p className="text-zinc-500">Score Atual: <strong className="text-zinc-900 font-mono">{selectedForCredit.scoreCredito || 650} pts</strong></p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Valor do Crédito (Kz)" required>
                <input type="number" step="50000" value={creditValor} onChange={e => setCreditValor(Number(e.target.value))} className={inputClass} required />
              </FormField>
              <FormField label="Prazo (Meses)" required>
                <input type="number" min="1" max="60" value={creditParcelas} onChange={e => setCreditParcelas(Number(e.target.value))} className={inputClass} required />
              </FormField>
            </div>
            <FormField label="Finalidade do Financiamento">
              <input type="text" value={creditFinalidade} onChange={e => setCreditFinalidade(e.target.value)} className={inputClass} />
            </FormField>
            <ModalFooter onCancel={() => setSelectedForCredit(null)}>
              <BtnPrimary type="submit" loading={isSubmittingCredit} icon={PlusCircle}>
                {isSubmittingCredit ? 'A Submeter...' : 'Criar Solicitação'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Modal Reavaliar Risco */}
      {selectedForRisk && (
        <Modal title={`Reavaliar Scoring — ${selectedForRisk.nome}`} icon={ShieldCheck} onClose={() => setSelectedForRisk(null)}>
          <form onSubmit={handleUpdateRiskSubmit} className="space-y-3.5">
            <FormField label="Novo Score de Crédito (300 a 900)" required>
              <input type="number" min="300" max="900" value={newScore} onChange={e => setNewScore(Number(e.target.value))} className={inputClass} required />
            </FormField>
            <FormField label="Classificação de Risco" required>
              <select value={newRisco} onChange={e => setNewRisco(e.target.value as 'BAIXO' | 'MEDIO' | 'ALTO')} className={inputClass}>
                <option value="BAIXO">Risco Baixo (Score 700+)</option>
                <option value="MEDIO">Risco Médio (Score 500-699)</option>
                <option value="ALTO">Risco Alto / Inadimplente (Score &lt; 500)</option>
              </select>
            </FormField>
            <ModalFooter onCancel={() => setSelectedForRisk(null)}>
              <BtnPrimary type="submit" loading={isSubmittingRisk} icon={ShieldCheck}>
                {isSubmittingRisk ? 'A Gravar...' : 'Atualizar Classificação'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </PageShell>
  )
}
