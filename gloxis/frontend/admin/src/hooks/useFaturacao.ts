import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'
import type { ClienteOption } from '../components/ClientSearchSelect'

export type StatusFatura = 'EMITIDA' | 'PAGA' | 'VENCIDA' | 'CANCELADA'

export interface Fatura {
  id: number
  clienteId: number | null
  clienteNome: string | null
  clienteNif: string | null
  tipoDocumento: string
  valor: number
  valorImposto: number
  valorRetencao: number
  status: StatusFatura
  hashAgt: string | null
  itensJson: string | null
  dataVencimento: string | null
  createdAt: string
}

export interface ItemFatura {
  descricao: string
  qtd: number
  precoUnit: number
}

export interface KpisFaturacao {
  totalFaturas: number
  valorFaturadoTotal: number
  faturasPagas: number
  faturasVencidas: number
  faturasEmitidas: number
}

export function useFaturacao() {
  const [faturas, setFaturas] = useState<Fatura[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')

  // KPIs
  const [kpis, setKpis] = useState<KpisFaturacao>({
    totalFaturas: 0,
    valorFaturadoTotal: 0,
    faturasPagas: 0,
    faturasVencidas: 0,
    faturasEmitidas: 0
  })

  // Modal Emitir Fatura
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<ClienteOption | null>(null)
  const [clienteNome, setClienteNome] = useState('')
  const [clienteNif, setClienteNif] = useState('')
  const [tipoDocumento, setTipoDocumento] = useState('FT')
  const [dataVencimento, setDataVencimento] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [itens, setItens] = useState<ItemFatura[]>([
    { descricao: 'Licenciamento de Software Gloxis Cloud', qtd: 1, precoUnit: 350000 },
    { descricao: 'Serviços de Manutenção & Suporte', qtd: 1, precoUnit: 50000 }
  ])

  // Modal View Fatura
  const [selectedFaturaView, setSelectedFaturaView] = useState<Fatura | null>(null)

  const loadData = useCallback(() => {
    setLoading(true)
    api.get('/faturacao')
      .then(res => {
        const payload = res.data?.data !== undefined ? res.data.data : res.data
        const arrayData = Array.isArray(payload) ? payload : (payload?.data || [])
        setFaturas(arrayData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadKpis = useCallback(() => {
    api.get('/faturacao/kpis')
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
    if (!window.confirm('Tem certeza que deseja anular esta fatura?')) return
    try {
      await api.delete(`/faturacao/${id}`)
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao anular fatura.')
    }
  }

  const handleUpdateStatus = async (id: number, newStatus: StatusFatura) => {
    try {
      await api.put(`/faturacao/${id}`, { status: newStatus })
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao atualizar estado da fatura.')
    }
  }

  const handleSelectClient = (client: ClienteOption | null) => {
    setSelectedCliente(client)
    if (client) {
      setClienteNome(client.nome)
      setClienteNif(client.nif)
    } else {
      setClienteNome('')
      setClienteNif('')
    }
  }

  // Calculate totals
  const subtotal = itens.reduce((acc, item) => acc + (item.qtd * item.precoUnit), 0)

  const handleAddItem = () => {
    setItens(prev => [...prev, { descricao: '', qtd: 1, precoUnit: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = <K extends keyof ItemFatura>(index: number, field: K, value: ItemFatura[K]) => {
    setItens(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (itens.length === 0 || subtotal <= 0) {
      alert('Adicione pelo menos um item válido com valor superior a zero.')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        cliente_id: selectedCliente?.id || null,
        cliente_nome: clienteNome || selectedCliente?.nome || 'Cliente Consumidor Final',
        cliente_nif: clienteNif || selectedCliente?.nif || '5418009900',
        tipo_documento: tipoDocumento,
        valor: subtotal,
        status: 'EMITIDA',
        itens: itens,
        data_vencimento: dataVencimento || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }

      const res = await api.post('/faturacao', payload)
      alert(`Documento Fiscal ${tipoDocumento}-${String(res.data.id || '').padStart(5, '0')} emitido e certificado via AGT com sucesso!`)

      setShowNewModal(false)
      setSelectedCliente(null)
      setClienteNome('')
      setClienteNif('')
      setItens([{ descricao: 'Serviços de Consultoria', qtd: 1, precoUnit: 100000 }])

      loadData()
      loadKpis()
    } catch (error: unknown) {
      console.error(error)
      alert('Erro ao emitir fatura.')
    } finally {
      setIsSaving(false)
    }
  }

  const filtered = faturas.filter(f => {
    const fnome = f.clienteNome || ''
    const matchSearch = String(f.id).includes(search) || fnome.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'TODOS' || f.status === statusFilter
    return matchSearch && matchStatus
  })

  return {
    faturas,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    kpis,
    showNewModal,
    setShowNewModal,
    selectedCliente,
    clienteNome,
    setClienteNome,
    clienteNif,
    setClienteNif,
    tipoDocumento,
    setTipoDocumento,
    dataVencimento,
    setDataVencimento,
    isSaving,
    itens,
    selectedFaturaView,
    setSelectedFaturaView,
    subtotal,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handleDelete,
    handleUpdateStatus,
    handleSelectClient,
    handleCreateSubmit,
    filtered,
  }
}
