import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'

export type StatusCompra = 'PENDENTE' | 'PAGO' | 'CANCELADO'

export interface Compra {
  id: number
  fornecedorId: number | null
  fornecedorNome: string | null
  fornecedorNif: string | null
  categoria: string
  formaPagamento: string
  valor: number
  status: StatusCompra
  itensJson: string | null
  notas: string | null
  comprador: string | null
  createdAt: string
}

export interface ItemCompra {
  descricao: string
  qtd: number
  precoUnit: number
}

export interface KpisCompras {
  totalCompras: number
  despesaTotal: number
  comprasPendentes: number
  comprasPagas: number
}

export function useCompras() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')

  // KPIs
  const [kpis, setKpis] = useState<KpisCompras>({
    totalCompras: 0,
    despesaTotal: 0,
    comprasPendentes: 0,
    comprasPagas: 0
  })

  // Modal New Purchase
  const [showNewModal, setShowNewModal] = useState(false)
  const [fornecedorNome, setFornecedorNome] = useState('')
  const [fornecedorNif, setFornecedorNif] = useState('')
  const [categoria, setCategoria] = useState('LICENCAS')
  const [formaPagamento, setFormaPagamento] = useState('TRANSFERENCIA')
  const [notas, setNotas] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [itens, setItens] = useState<ItemCompra[]>([
    { descricao: 'Servidores Dell PowerEdge R750', qtd: 1, precoUnit: 1250000 },
    { descricao: 'Manutenção de Infraestrutura', qtd: 1, precoUnit: 150000 }
  ])

  // Modal View Purchase
  const [selectedCompraView, setSelectedCompraView] = useState<Compra | null>(null)

  const loadData = useCallback(() => {
    setLoading(true)
    api.get('/compras')
      .then(res => {
        const payload = res.data?.data !== undefined ? res.data.data : res.data
        const arrayData = Array.isArray(payload) ? payload : (payload?.data || [])
        setCompras(arrayData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadKpis = useCallback(() => {
    api.get('/compras/kpis')
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
    if (!window.confirm('Tem certeza que deseja cancelar esta ordem de compra?')) return
    try {
      await api.delete(`/compras/${id}`)
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao cancelar ordem de compra.')
    }
  }

  const handleUpdateStatus = async (id: number, newStatus: StatusCompra) => {
    try {
      await api.put(`/compras/${id}`, { status: newStatus })
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao atualizar estado da ordem de compra.')
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

  const handleItemChange = <K extends keyof ItemCompra>(index: number, field: K, value: ItemCompra[K]) => {
    setItens(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (itens.length === 0 || subtotal <= 0) {
      alert('Adicione pelo menos um item válido.')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        fornecedor_nome: fornecedorNome || 'Fornecedor de Tecnologia S.A.',
        fornecedor_nif: fornecedorNif || '5419082211',
        categoria,
        forma_pagamento: formaPagamento,
        valor: subtotal,
        status: 'PENDENTE',
        itens: itens,
        notas,
        comprador: 'Diretor de Operações Gloxis'
      }

      const res = await api.post('/compras', payload)
      alert(`Ordem de Compra OC-${String(res.data.id || '').padStart(4, '0')} emitida com sucesso!`)

      setShowNewModal(false)
      setFornecedorNome('')
      setFornecedorNif('')
      setNotas('')
      setItens([{ descricao: 'Equipamento TI', qtd: 1, precoUnit: 50000 }])

      loadData()
      loadKpis()
    } catch (error: unknown) {
      console.error(error)
      alert('Erro ao criar ordem de compra.')
    } finally {
      setIsSaving(false)
    }
  }

  const filtered = compras.filter(c => {
    const fnome = c.fornecedorNome || ''
    const matchSearch = String(c.id).includes(search) || fnome.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'TODOS' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  return {
    compras,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    kpis,
    showNewModal,
    setShowNewModal,
    fornecedorNome,
    setFornecedorNome,
    fornecedorNif,
    setFornecedorNif,
    categoria,
    setCategoria,
    formaPagamento,
    setFormaPagamento,
    notas,
    setNotas,
    isSaving,
    itens,
    selectedCompraView,
    setSelectedCompraView,
    subtotal,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handleDelete,
    handleUpdateStatus,
    handleCreateSubmit,
    filtered,
  }
}
