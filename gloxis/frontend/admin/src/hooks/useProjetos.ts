import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'

export type StatusProjeto = 'PLANEAMENTO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'

export interface Projeto {
  id: number
  nome: string
  gerenteProjeto: string | null
  clienteNome: string | null
  orcamento: number
  progressoPercentual: number
  status: StatusProjeto
  dataInicio: string | null
  dataPrevistaFim: string | null
  createdAt: string
}

export interface KpisProjetos {
  totalProjetos: number
  projetosEmAndamento: number
  orcamentoTotalGeral: number
  projetosConcluidos: number
}

export function useProjetos() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')

  // KPIs
  const [kpis, setKpis] = useState<KpisProjetos>({
    totalProjetos: 0,
    projetosEmAndamento: 0,
    orcamentoTotalGeral: 0,
    projetosConcluidos: 0
  })

  // Modal Criar Projeto
  const [showModal, setShowModal] = useState(false)
  const [nome, setNome] = useState('')
  const [gerenteProjeto, setGerenteProjeto] = useState('Eng. Manuel Santos')
  const [clienteNome, setClienteNome] = useState('')
  const [orcamento, setOrcamento] = useState(3500000)
  const [progressoPercentual, setProgressoPercentual] = useState(15)
  const [status, setStatus] = useState<StatusProjeto>('EM_ANDAMENTO')
  const [dataInicio, setDataInicio] = useState('')
  const [dataPrevistaFim, setDataPrevistaFim] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Modal Gestão de Progresso & Fase
  const [selectedForProgress, setSelectedForProgress] = useState<Projeto | null>(null)
  const [newProgresso, setNewProgresso] = useState<number>(0)
  const [newStatus, setNewStatus] = useState<StatusProjeto>('EM_ANDAMENTO')
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false)

  const loadData = useCallback(() => {
    setLoading(true)
    api.get('/projetos')
      .then(res => {
        const payload = res.data?.data !== undefined ? res.data.data : res.data
        const arrayData = Array.isArray(payload) ? payload : (payload?.data || [])
        setProjetos(arrayData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadKpis = useCallback(() => {
    api.get('/projetos/kpis')
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
    if (!window.confirm('Tem certeza que deseja cancelar / remover este projeto?')) return
    try {
      await api.delete(`/projetos/${id}`)
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao apagar projeto.')
    }
  }

  const handleUpdateProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedForProgress) return
    setIsUpdatingProgress(true)
    try {
      await api.put(`/projetos/${selectedForProgress.id}`, {
        progresso_percentual: Number(newProgresso),
        status: newStatus
      })

      alert(`Progresso do projeto ${selectedForProgress.nome} atualizado para ${newProgresso}% (${newStatus})!`)
      setSelectedForProgress(null)
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao atualizar progresso do projeto.')
    } finally {
      setIsUpdatingProgress(false)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const payload = {
        nome: nome || 'Projeto Corporativo Gloxis',
        gerente_projeto: gerenteProjeto,
        cliente_nome: clienteNome || 'Cliente Interno / Corporativo',
        orcamento: Number(orcamento),
        progresso_percentual: Number(progressoPercentual),
        status,
        data_inicio: dataInicio || new Date().toISOString().split('T')[0],
        data_prevista_fim: dataPrevistaFim || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }

      await api.post('/projetos', payload)
      alert('Projeto registado com sucesso!')

      setShowModal(false)
      setNome('')
      setClienteNome('')
      setOrcamento(3500000)

      loadData()
      loadKpis()
    } catch (error: unknown) {
      console.error(error)
      alert('Erro ao criar projeto.')
    } finally {
      setIsSaving(false)
    }
  }

  const filtered = projetos.filter(p => {
    const pnome = p.nome || ''
    const pgerente = p.gerenteProjeto || ''
    const pcliente = p.clienteNome || ''
    const matchSearch = String(p.id).includes(search) || 
                        pnome.toLowerCase().includes(search.toLowerCase()) ||
                        pgerente.toLowerCase().includes(search.toLowerCase()) ||
                        pcliente.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'TODOS' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  return {
    projetos,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    kpis,
    showModal,
    setShowModal,
    nome,
    setNome,
    gerenteProjeto,
    setGerenteProjeto,
    clienteNome,
    setClienteNome,
    orcamento,
    setOrcamento,
    progressoPercentual,
    setProgressoPercentual,
    status,
    setStatus,
    dataInicio,
    setDataInicio,
    dataPrevistaFim,
    setDataPrevistaFim,
    isSaving,
    selectedForProgress,
    setSelectedForProgress,
    newProgresso,
    setNewProgresso,
    newStatus,
    setNewStatus,
    isUpdatingProgress,
    handleDelete,
    handleUpdateProgressSubmit,
    handleCreateSubmit,
    filtered,
  }
}
