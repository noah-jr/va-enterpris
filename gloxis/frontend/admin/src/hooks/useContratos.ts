import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'

export type StatusContrato = 'ATIVO' | 'CANCELADO' | 'EXPIRADO'

export interface Contrato {
  id: number
  titulo: string
  tipo: string
  parteContratante: string | null
  valorContrato: number
  status: StatusContrato
  dataInicio: string | null
  dataFim: string | null
  createdAt: string
}

export interface KpisContratos {
  totalContratos: number
  contratosAtivos: number
  valorCarteiraContratos: number
  contratosExpirados: number
}

export function useContratos() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')

  // KPIs
  const [kpis, setKpis] = useState<KpisContratos>({
    totalContratos: 0,
    contratosAtivos: 0,
    valorCarteiraContratos: 0,
    contratosExpirados: 0
  })

  // Modal Novo Contrato
  const [showModal, setShowModal] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState('PRESTACAO_SERVICOS')
  const [parteContratante, setParteContratante] = useState('')
  const [valorContrato, setValorContrato] = useState(1200000)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [status, setStatus] = useState<StatusContrato>('ATIVO')
  const [isSaving, setIsSaving] = useState(false)

  // Modal Renovar Contrato / Aditivo
  const [selectedForRenew, setSelectedForRenew] = useState<Contrato | null>(null)
  const [valorAditivo, setValorAditivo] = useState(500000)
  const [isRenewing, setIsRenewing] = useState(false)

  // Modal Alterar Estado
  const [selectedForStatus, setSelectedForStatus] = useState<Contrato | null>(null)
  const [newStatus, setNewStatus] = useState<StatusContrato>('ATIVO')

  const loadData = useCallback(() => {
    setLoading(true)
    api.get('/contratos')
      .then(res => {
        const payload = res.data?.data !== undefined ? res.data.data : res.data
        const arrayData = Array.isArray(payload) ? payload : (payload?.data || [])
        setContratos(arrayData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadKpis = useCallback(() => {
    api.get('/contratos/kpis')
      .then(res => {
        if (res.data) setKpis(res.data)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    loadData()
    loadKpis()
  }, [loadData, loadKpis])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja rescindir este contrato?')) return
    try {
      await api.delete(`/contratos/${id}`)
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao apagar contrato.')
    }
  }

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedForRenew) return
    setIsRenewing(true)
    try {
      const novoValor = Number(selectedForRenew.valorContrato || 0) + Number(valorAditivo)
      const novaDataFim = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      await api.put(`/contratos/${selectedForRenew.id}`, {
        valor_contrato: novoValor,
        data_fim: novaDataFim,
        status: 'ATIVO'
      })

      alert(`Contrato CTR-${selectedForRenew.id} renovado com sucesso! Novo Valor: Kz ${novoValor.toLocaleString('pt-AO')}`)
      setSelectedForRenew(null)
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao renovar contrato.')
    } finally {
      setIsRenewing(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedForStatus) return
    try {
      await api.put(`/contratos/${selectedForStatus.id}`, { status: newStatus })
      alert(`Estado do contrato CTR-${selectedForStatus.id} alterado para ${newStatus} com sucesso!`)
      setSelectedForStatus(null)
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao atualizar estado do contrato.')
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const payload = {
        titulo: titulo || 'Contrato de Prestação de Serviços',
        tipo,
        parte_contratante: parteContratante || 'Empresa Parceira S.A.',
        valor_contrato: Number(valorContrato),
        status,
        data_inicio: dataInicio || new Date().toISOString().split('T')[0],
        data_fim: dataFim || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }

      await api.post('/contratos', payload)
      alert('Contrato celebrado e registado com sucesso!')

      setShowModal(false)
      setTitulo('')
      setParteContratante('')
      setValorContrato(1200000)

      loadData()
      loadKpis()
    } catch (error: unknown) {
      console.error(error)
      alert('Erro ao celebrar contrato.')
    } finally {
      setIsSaving(false)
    }
  }

  const filtered = contratos.filter(c => {
    const ctitulo = c.titulo || ''
    const cparte = c.parteContratante || ''
    const matchSearch = String(c.id).includes(search) || 
                        ctitulo.toLowerCase().includes(search.toLowerCase()) ||
                        cparte.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'TODOS' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  return {
    contratos,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    kpis,
    showModal,
    setShowModal,
    titulo,
    setTitulo,
    tipo,
    setTipo,
    parteContratante,
    setParteContratante,
    valorContrato,
    setValorContrato,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    status,
    setStatus,
    isSaving,
    selectedForRenew,
    setSelectedForRenew,
    valorAditivo,
    setValorAditivo,
    isRenewing,
    selectedForStatus,
    setSelectedForStatus,
    newStatus,
    setNewStatus,
    handleDelete,
    handleRenewSubmit,
    handleUpdateStatus,
    handleCreateSubmit,
    filtered,
  }
}
