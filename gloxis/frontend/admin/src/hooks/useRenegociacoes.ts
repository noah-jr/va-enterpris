import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'

export interface Renegociacao {
  id: number
  solicitacaoId: number
  saldoDevedorOriginal: number
  novoSaldoDevedor: number
  jurosMoraPerdoados: number
  multasPerdoadas: number
  novasParcelas: number
  novaTaxaJuros: number
  status: 'PENDENTE_APROVADA' | 'APROVADA' | 'REJEITADA' | 'PENDENTE_APROVACAO'
  createdAt: string
  solicitacao?: {
    cliente?: { nome: string; nif: string }
  }
}

export function useRenegociacoes() {
  const [lista, setLista] = useState<Renegociacao[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Modal Nova Solicitação de Renegociação
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [solicitacaoId, setSolicitacaoId] = useState('')
  const [saldoOriginal, setSaldoOriginal] = useState(4500000)
  const [novoSaldo, setNovoSaldo] = useState(3800000)
  const [jurosPerdoados, setJurosPerdoados] = useState(500000)
  const [multasPerdoadas, setMultasPerdoadas] = useState(200000)
  const [novasParcelas, setNovasParcelas] = useState(18)
  const [novaTaxaJuros, setNovaTaxaJuros] = useState(2.5)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const load = useCallback(() => {
    setLoading(true)
    api.get('/renegociacoes')
      .then(res => {
        const payload = res.data?.data || res.data
        const arrayData = Array.isArray(payload) ? payload : (payload?.data || [])
        setLista(arrayData)
      })
      .catch(() => setLista([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const aprovar = async (id: number) => {
    setActionLoading(id)
    try {
      await api.post(`/renegociacoes/${id}/aprovar`)
      showToast(`Renegociação #${id} aprovada e novo plano de amortização gerado!`, 'success')
      load()
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } }
      showToast(errObj.response?.data?.message || 'Erro ao aprovar renegociação.', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/renegociacoes', {
        solicitacaoId: Number(solicitacaoId),
        saldoDevedorOriginal: Number(saldoOriginal),
        novoSaldoDevedor: Number(novoSaldo),
        jurosMoraPerdoados: Number(jurosPerdoados),
        multasPerdoadas: Number(multasPerdoadas),
        novasParcelas: Number(novasParcelas),
        novaTaxaJuros: Number(novaTaxaJuros)
      })
      showToast('Pedido de renegociação registado para análise do comité!', 'success')
      setShowCreateModal(false)
      load()
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } }
      showToast(errObj.response?.data?.message || 'Erro ao criar renegociação.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filtered = lista.filter(r => {
    const matchSearch = String(r.id).includes(search) ||
      String(r.solicitacaoId).includes(search) ||
      r.solicitacao?.cliente?.nome?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || r.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  const totalReestruturado = lista.filter(r => r.status === 'APROVADA').reduce((acc, r) => acc + Number(r.novoSaldoDevedor), 0)
  const totalPerdoado = lista.filter(r => r.status === 'APROVADA').reduce((acc, r) => acc + Number(r.jurosMoraPerdoados) + Number(r.multasPerdoadas), 0)
  const pendentesCount = lista.filter(r => r.status === 'PENDENTE_APROVACAO').length

  return {
    lista,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    actionLoading,
    toast,
    showCreateModal,
    setShowCreateModal,
    solicitacaoId,
    setSolicitacaoId,
    saldoOriginal,
    setSaldoOriginal,
    novoSaldo,
    setNovoSaldo,
    jurosPerdoados,
    setJurosPerdoados,
    multasPerdoadas,
    setMultasPerdoadas,
    novasParcelas,
    setNovasParcelas,
    novaTaxaJuros,
    setNovaTaxaJuros,
    isSubmitting,
    load,
    aprovar,
    handleCreateSubmit,
    filtered,
    totalItems,
    totalPages,
    paginated,
    totalReestruturado,
    totalPerdoado,
    pendentesCount,
  }
}
