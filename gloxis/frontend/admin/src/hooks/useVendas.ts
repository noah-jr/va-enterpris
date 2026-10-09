import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'

export type StatusVenda = 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'FATURADO'

export interface Venda {
  id: number
  clienteId: number | null
  clienteNome: string | null
  clienteEmail: string | null
  valor: number
  status: StatusVenda
  formaPagamento: string
  itensJson: string | null
  desconto: number
  impostoIva: number
  notas: string | null
  vendedor: string | null
  createdAt: string
}

export interface Cliente {
  id: number
  nome: string
  email: string
  telefone?: string
  nif?: string
}

export interface ItemVenda {
  descricao: string
  qtd: number
  precoUnit: number
}

export interface KpisVendas {
  totalVendas: number
  receitaTotal: number
  vendasPendentes: number
  vendasPagas: number
  ticketMedio: number
}

export function useVendas() {
  const [activeTab, setActiveTab] = useState<'vendas' | 'pos' | 'orcamentos'>('vendas')

  const [vendas, setVendas] = useState<Venda[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')

  // KPIs
  const [kpis, setKpis] = useState<KpisVendas>({
    totalVendas: 0,
    receitaTotal: 0,
    vendasPendentes: 0,
    vendasPagas: 0,
    ticketMedio: 0
  })

  // POS / Form State
  const [selectedClienteId, setSelectedClienteId] = useState<string>('')
  const [clienteNomeManual, setClienteNomeManual] = useState('')
  const [clienteEmailManual, setClienteEmailManual] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('MULTICAIXA')
  const [descontoPerc, setDescontoPerc] = useState(0)
  const [impostoIvaPerc, setImpostoIvaPerc] = useState(14)
  const [notasVenda, setNotasVenda] = useState('')
  const [isSavingVenda, setIsSavingVenda] = useState(false)

  // Modal Aplicar Desconto Especial
  const [selectedForDiscount, setSelectedForDiscount] = useState<Venda | null>(null)
  const [descontoValorEspecial, setDescontoValorEspecial] = useState(50000)

  // Items List in POS
  const [itens, setItens] = useState<ItemVenda[]>([
    { descricao: 'Licença Gloxis Enterprise ERP (Anual)', qtd: 1, precoUnit: 450000 },
    { descricao: 'Suporte Técnico & Consultoria', qtd: 2, precoUnit: 25000 }
  ])

  // Receipt Modal
  const [selectedVendaReceipt, setSelectedVendaReceipt] = useState<Venda | null>(null)

  const loadData = useCallback(() => {
    setLoading(true)
    api.get('/vendas')
      .then(res => {
        const payload = res.data?.data !== undefined ? res.data.data : res.data
        const arrayData = Array.isArray(payload) ? payload : (payload?.data || [])
        setVendas(arrayData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadKpis = useCallback(() => {
    api.get('/vendas/kpis')
      .then(res => {
        if (res.data) setKpis(res.data)
      })
      .catch(console.error)
  }, [])

  const loadClientes = useCallback(() => {
    api.get('/clientes')
      .then(res => {
        const payload = res.data?.data !== undefined ? res.data.data : res.data
        setClientes(Array.isArray(payload) ? payload : [])
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    loadData()
    loadKpis()
    loadClientes()
  }, [loadData, loadKpis, loadClientes])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta venda?')) return
    try {
      await api.delete(`/vendas/${id}`)
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao cancelar venda.')
    }
  }

  const handleUpdateStatus = async (id: number, newStatus: StatusVenda) => {
    try {
      await api.put(`/vendas/${id}`, { status: newStatus })
      alert(`Venda VND-${String(id).padStart(4, '0')} atualizada para estado: ${newStatus}!`)
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao atualizar estado da venda.')
    }
  }

  const handleApplyDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedForDiscount) return
    try {
      const valorAtual = Number(selectedForDiscount.valor || 0)
      const novoValor = Math.max(0, valorAtual - Number(descontoValorEspecial))
      await api.put(`/vendas/${selectedForDiscount.id}`, { valor: novoValor, desconto: Number(descontoValorEspecial) })
      alert(`Desconto comercial de Kz ${descontoValorEspecial.toLocaleString('pt-AO')} aplicado com sucesso à venda VND-${selectedForDiscount.id}!`)
      setSelectedForDiscount(null)
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao aplicar desconto especial.')
    }
  }

  // Calculate POS totals
  const subtotal = itens.reduce((acc, item) => acc + (item.qtd * item.precoUnit), 0)
  const valorDesconto = (subtotal * descontoPerc) / 100
  const valorIva = ((subtotal - valorDesconto) * impostoIvaPerc) / 100
  const totalFinal = subtotal - valorDesconto + valorIva

  const handleAddItem = () => {
    setItens(prev => [...prev, { descricao: '', qtd: 1, precoUnit: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = <K extends keyof ItemVenda>(index: number, field: K, value: ItemVenda[K]) => {
    setItens(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const handleCreateVendaSubmit = async (e: React.FormEvent, statusInicial: 'PAGO' | 'PENDENTE' = 'PAGO') => {
    e.preventDefault()
    if (itens.length === 0 || subtotal <= 0) {
      alert('Adicione pelo menos um item válido com valor superior a zero.')
      return
    }

    setIsSavingVenda(true)
    try {
      const clienteObj = clientes.find(c => c.id === Number(selectedClienteId))
      const nomeFinal = clienteObj ? clienteObj.nome : (clienteNomeManual || 'Consumidor Final')
      const emailFinal = clienteObj ? clienteObj.email : (clienteEmailManual || '')

      const payload = {
        cliente_id: selectedClienteId ? Number(selectedClienteId) : null,
        cliente_nome: nomeFinal,
        cliente_email: emailFinal,
        valor: totalFinal,
        status: statusInicial,
        forma_pagamento: formaPagamento,
        itens: itens,
        desconto: valorDesconto,
        imposto_iva: impostoIvaPerc,
        notas: notasVenda,
        vendedor: 'Operador de Vendas Gloxis ERP'
      }

      const res = await api.post('/vendas', payload)
      alert(`Venda VND-${String(res.data.id || '').padStart(4, '0')} emitida e gravada com sucesso!`)
      
      setSelectedClienteId('')
      setClienteNomeManual('')
      setClienteEmailManual('')
      setNotasVenda('')
      setItens([{ descricao: 'Produto / Serviço Exemplo', qtd: 1, precoUnit: 10000 }])
      
      loadData()
      loadKpis()
      setActiveTab('vendas')
    } catch (error: unknown) {
      console.error(error)
      const msg = error instanceof Error ? error.message : 'Erro ao guardar venda'
      alert('Erro ao guardar venda: ' + msg)
    } finally {
      setIsSavingVenda(false)
    }
  }

  const filteredVendas = vendas.filter(v => {
    const searchMatch = String(v.id).includes(search) || 
                        (v.clienteNome && v.clienteNome.toLowerCase().includes(search.toLowerCase())) ||
                        (v.vendedor && v.vendedor.toLowerCase().includes(search.toLowerCase()))
    const statusMatch = statusFilter === 'TODOS' || v.status === statusFilter
    return searchMatch && statusMatch
  })

  return {
    activeTab,
    setActiveTab,
    vendas,
    clientes,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    kpis,
    selectedClienteId,
    setSelectedClienteId,
    clienteNomeManual,
    setClienteNomeManual,
    clienteEmailManual,
    setClienteEmailManual,
    formaPagamento,
    setFormaPagamento,
    descontoPerc,
    setDescontoPerc,
    impostoIvaPerc,
    setImpostoIvaPerc,
    notasVenda,
    setNotasVenda,
    isSavingVenda,
    selectedForDiscount,
    setSelectedForDiscount,
    descontoValorEspecial,
    setDescontoValorEspecial,
    itens,
    selectedVendaReceipt,
    setSelectedVendaReceipt,
    subtotal,
    valorDesconto,
    valorIva,
    totalFinal,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handleDelete,
    handleUpdateStatus,
    handleApplyDiscountSubmit,
    handleCreateVendaSubmit,
    filteredVendas,
  }
}
