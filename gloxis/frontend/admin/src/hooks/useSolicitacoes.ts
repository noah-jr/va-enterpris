import React, { useState } from 'react'
import { api } from '../api/client'
import { useFileUrl } from './useFileUrl'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import type { ClienteOption } from '../components/ClientSearchSelect'

export interface Solicitacao {
  id: number
  clienteId: number
  valor: number
  valorSolicitado?: number
  parcelas: number
  numParcelas?: number
  prazoMeses?: number
  taxaJuros?: number
  finalidade?: string
  status: 'PENDENTE' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO' | 'REPROVADO' | 'DESEMBOLSADO' | 'CANCELADO'
  comprovativoUrl?: string
  motivoRejeicao?: string
  createdAt: string
  cliente?: { nome: string; nif: string; email?: string; scoreCredito?: number; risco?: string; contaBancaria?: string }
  clienteNome?: string
}

export function useSolicitacoes() {
  const { getApiUrl } = useFileUrl()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [pdfModal, setPdfModal] = useState<{ isOpen: boolean; title: string; url: string }>({
    isOpen: false,
    title: '',
    url: ''
  })

  // Modal Análise & Desembolso & Rejeição
  const [selectedForAnalysis, setSelectedForAnalysis] = useState<Solicitacao | null>(null)
  const [selectedForRejection, setSelectedForRejection] = useState<Solicitacao | null>(null)
  const [taxaJurosAprovada, setTaxaJurosAprovada] = useState<number>(3.5)
  const [parecerCredito, setParecerCredito] = useState('Análise de risco concluída: Mutuário sem incidentes no BNA. Rácio DSR sustentável.')
  const [motivoRejeicao, setMotivoRejeicao] = useState('')
  const [desembolsoMode, setDesembolsoMode] = useState(false)
  const [desembolsando, setDesembolsando] = useState(false)

  // Modal Nova Solicitação
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<ClienteOption | null>(null)
  const [newValor, setNewValor] = useState(1500000)
  const [newParcelas, setNewParcelas] = useState(12)
  const [newFinalidade, setNewFinalidade] = useState('Expansão de Capital de Giro')
  const [isSubmittingNew, setIsSubmittingNew] = useState(false)

  // Query TanStack Query com paginação do servidor e filtros
  const { data: responseData, isLoading: loading, refetch: load } = useQuery({
    queryKey: [queryKeys.solicitacoes.all, currentPage, perPage, search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/solicitacoes', {
        params: {
          page: currentPage,
          perPage: perPage,
          search: search || undefined,
          status: statusFilter !== 'TODOS' ? statusFilter : undefined
        }
      })
      return res.data
    }
  })

  // Tratar resposta paginada do backend
  const paginated: Solicitacao[] = Array.isArray(responseData)
    ? responseData
    : (responseData?.data || [])
  const totalItems: number = responseData?.meta?.total ?? responseData?.total ?? paginated.length
  const totalPages: number = responseData?.meta?.lastPage ?? responseData?.lastPage ?? (Math.ceil(totalItems / perPage) || 1)

  const createMutation = useMutation({
    mutationFn: async (data: { clienteId: number; valor: number; parcelas: number; finalidade: string }) => {
      const res = await api.post('/solicitacoes', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.solicitacoes.all] })
    }
  })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const updateStatus = async (id: number, status: string, customMotivo?: string) => {
    setActionLoading(id)
    try {
      await api.patch(`/solicitacoes/${id}/status`, {
        status,
        motivoRejeicao: customMotivo || motivoRejeicao || undefined
      })
      showToast(`Solicitação #${id} atualizada para ${status}!`, 'success')
      setSelectedForAnalysis(null)
      setSelectedForRejection(null)
      setMotivoRejeicao('')
      queryClient.invalidateQueries({ queryKey: [queryKeys.solicitacoes.all] })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message || (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao atualizar status.'
      showToast(msg, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleConfirmRejection = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const target = selectedForRejection || selectedForAnalysis
    if (!target) return
    if (!motivoRejeicao.trim()) {
      showToast('Por favor, indique a justificativa ou motivo do indeferimento.', 'error')
      return
    }
    await updateStatus(target.id, 'REJEITADO', motivoRejeicao)
  }

  const handleDesembolsoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedForAnalysis) return
    setDesembolsando(true)
    try {
      const fd = new FormData(e.currentTarget)
      fd.append('solicitacaoId', String(selectedForAnalysis.id))
      await api.post('/operacoes/desembolsos', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      showToast(`Desembolso de crédito #${selectedForAnalysis.id} efetuado com sucesso!`, 'success')
      setSelectedForAnalysis(null)
      setDesembolsoMode(false)
      queryClient.invalidateQueries({ queryKey: [queryKeys.solicitacoes.all] })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao processar desembolso.'
      showToast(msg, 'error')
    } finally {
      setDesembolsando(false)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCliente) {
      showToast('Selecione uma entidade mutuária para a solicitação.', 'error')
      return
    }
    setIsSubmittingNew(true)
    try {
      await createMutation.mutateAsync({
        clienteId: selectedCliente.id,
        valor: Number(newValor),
        parcelas: Number(newParcelas),
        finalidade: newFinalidade
      })
      showToast('Nova solicitação de crédito registada com sucesso!', 'success')
      setShowCreateModal(false)
      setSelectedCliente(null)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error || (err as { message?: string }).message
      showToast('Erro ao criar solicitação: ' + msg, 'error')
    } finally {
      setIsSubmittingNew(false)
    }
  }

  return {
    getApiUrl,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    actionLoading,
    toast,
    pdfModal,
    setPdfModal,
    selectedForAnalysis,
    setSelectedForAnalysis,
    selectedForRejection,
    setSelectedForRejection,
    taxaJurosAprovada,
    setTaxaJurosAprovada,
    parecerCredito,
    setParecerCredito,
    motivoRejeicao,
    setMotivoRejeicao,
    desembolsoMode,
    setDesembolsoMode,
    desembolsando,
    showCreateModal,
    setShowCreateModal,
    selectedCliente,
    setSelectedCliente,
    newValor,
    setNewValor,
    newParcelas,
    setNewParcelas,
    newFinalidade,
    setNewFinalidade,
    isSubmittingNew,
    load,
    updateStatus,
    handleConfirmRejection,
    handleDesembolsoSubmit,
    handleCreateSubmit,
    totalItems,
    totalPages,
    paginated,
  }
}
