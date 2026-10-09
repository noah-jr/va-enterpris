import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'

export interface Garantia {
  id: number
  solicitacaoId: number
  tipo: string
  descricao: string
  valorEstimado: number
  valorAvaliado: number
  statusAvaliacao: string
  createdAt?: string
}

export function useGarantias() {
  const [garantias, setGarantias] = useState<Garantia[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [solicitacaoIdFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Modal Registo de Nova Garantia
  const [showAddModal, setShowAddModal] = useState(false)
  const [solicitacaoId, setSolicitacaoId] = useState('1')
  const [tipo, setTipo] = useState('HIPOTECA_IMOVEL')
  const [descricao, setDescricao] = useState('Imóvel Comercial situado na Av. 4 de Fevereiro, Luanda')
  const [valorEstimado, setValorEstimado] = useState(25000000)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Modal Avaliação Pericial
  const [selectedForEval, setSelectedForEval] = useState<Garantia | null>(null)
  const [valorAvaliadoManual, setValorAvaliadoManual] = useState<number>(0)
  const [parecerAvaliacao, setParecerAvaliacao] = useState('Avaliação pericial efetuada por perito credenciado. Valor de liquidação forçada aceitável.')

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const loadGarantias = useCallback(async () => {
    setLoading(true)
    try {
      const url = solicitacaoIdFilter ? `/garantias/solicitacao/${solicitacaoIdFilter}` : '/garantias/solicitacao/1'
      const res = await api.get(url)
      const payload = res.data?.data || res.data
      const arrayData = Array.isArray(payload) ? payload : (payload?.data || [])
      setGarantias(arrayData)
    } catch {
      setGarantias([])
    } finally {
      setLoading(false)
    }
  }, [solicitacaoIdFilter])

  useEffect(() => {
    loadGarantias()
  }, [loadGarantias])

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/garantias', {
        solicitacaoId: Number(solicitacaoId),
        tipo,
        descricao,
        valorEstimado: Number(valorEstimado)
      })
      showToast('Garantia / Colateral registada com sucesso!', 'success')
      setShowAddModal(false)
      loadGarantias()
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } }
      showToast(errObj.response?.data?.message || 'Erro ao registar garantia.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAvaliarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedForEval) return
    setIsSubmitting(true)
    try {
      await api.post(`/garantias/${selectedForEval.id}/avaliar`, {
        statusAvaliacao: 'APROVADA',
        valorAvaliado: Number(valorAvaliadoManual)
      })
      showToast(`Garantia #${selectedForEval.id} avaliada e aprovada!`, 'success')
      setSelectedForEval(null)
      loadGarantias()
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } }
      showToast(errObj.response?.data?.message || 'Erro ao submeter avaliação.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = garantias.filter(g => {
    const matchSearch = String(g.solicitacaoId).includes(search) ||
      g.tipo?.toLowerCase().includes(search.toLowerCase()) ||
      g.descricao?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || g.statusAvaliacao === statusFilter
    return matchSearch && matchStatus
  })

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)
  const totalAvaliado = garantias.filter(g => g.statusAvaliacao === 'APROVADA').reduce((acc, g) => acc + Number(g.valorAvaliado || g.valorEstimado), 0)

  return {
    garantias,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    loading,
    toast,
    showAddModal,
    setShowAddModal,
    solicitacaoId,
    setSolicitacaoId,
    tipo,
    setTipo,
    descricao,
    setDescricao,
    valorEstimado,
    setValorEstimado,
    isSubmitting,
    selectedForEval,
    setSelectedForEval,
    valorAvaliadoManual,
    setValorAvaliadoManual,
    parecerAvaliacao,
    setParecerAvaliacao,
    loadGarantias,
    handleAddSubmit,
    handleAvaliarSubmit,
    filtered,
    totalItems,
    totalPages,
    paginated,
    totalAvaliado,
  }
}
