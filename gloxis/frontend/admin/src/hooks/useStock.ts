import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'

export interface StockItem {
  id: number
  produtoId: number
  nome: string | null
  codigoSku: string | null
  categoria: string
  quantidade: number
  precoUnitario: number
  localizacao: string
  minimoAlerta: number
  createdAt: string
}

export interface KpisStock {
  totalItens: number
  valorTotalEstoque: number
  itensCriticos: number
  totalUnidades: number
}

export function useStock() {
  const [items, setItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('TODOS')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // KPIs
  const [kpis, setKpis] = useState<KpisStock>({
    totalItens: 0,
    valorTotalEstoque: 0,
    itensCriticos: 0,
    totalUnidades: 0
  })

  // New Item Modal
  const [showModal, setShowModal] = useState(false)
  const [nome, setNome] = useState('')
  const [codigoSku, setCodigoSku] = useState('')
  const [categoria, setCategoria] = useState('HARDWARE')
  const [quantidade, setQuantidade] = useState(50)
  const [precoUnitario, setPrecoUnitario] = useState(25000)
  const [localizacao, setLocalizacao] = useState('Armazém Central - Luanda')
  const [minimoAlerta, setMinimoAlerta] = useState(10)
  const [isSaving, setIsSaving] = useState(false)

  // Modal Movimentação de Stock
  const [selectedForMovement, setSelectedForMovement] = useState<StockItem | null>(null)
  const [tipoMovimento, setTipoMovimento] = useState<'ENTRADA' | 'SAIDA' | 'AJUSTE'>('ENTRADA')
  const [qtdMovimento, setQtdMovimento] = useState(10)
  const [motivoMovimento, setMotivoMovimento] = useState('Receção de lote de fornecedor')
  const [isSubmittingMovement, setIsSubmittingMovement] = useState(false)

  // Modal Transferência de Armazém
  const [selectedForTransfer, setSelectedForTransfer] = useState<StockItem | null>(null)
  const [novoArmazem, setNovoArmazem] = useState('Armazém Filial - Benguela')

  const loadData = useCallback(() => {
    setLoading(true)
    api.get('/stock')
      .then(res => {
        const payload = res.data?.data !== undefined ? res.data.data : res.data
        const arrayData = Array.isArray(payload) ? payload : (payload?.data || [])
        setItems(arrayData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadKpis = useCallback(() => {
    api.get('/stock/kpis')
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
    if (!window.confirm('Tem certeza que deseja remover este item do inventário?')) return
    try {
      await api.delete(`/stock/${id}`)
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao remover item.')
    }
  }

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedForMovement) return
    setIsSubmittingMovement(true)
    try {
      const qtdAtual = Number(selectedForMovement.quantidade || 0)
      let novaQtd = qtdAtual
      if (tipoMovimento === 'ENTRADA') novaQtd += Number(qtdMovimento)
      else if (tipoMovimento === 'SAIDA') novaQtd = Math.max(0, qtdAtual - Number(qtdMovimento))
      else if (tipoMovimento === 'AJUSTE') novaQtd = Number(qtdMovimento)

      await api.put(`/stock/${selectedForMovement.id}`, { quantidade: novaQtd })

      alert(`Movimento de ${tipoMovimento} registado para SKU ${selectedForMovement.codigoSku}! Nova Qtd: ${novaQtd} un.`)
      setSelectedForMovement(null)
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao registar movimento de stock.')
    } finally {
      setIsSubmittingMovement(false)
    }
  }

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedForTransfer) return
    try {
      await api.put(`/stock/${selectedForTransfer.id}`, { localizacao: novoArmazem })
      alert(`Transferência de stock efetuada com sucesso para: ${novoArmazem}!`)
      setSelectedForTransfer(null)
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao transferir stock.')
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const payload = {
        nome: nome || 'Equipamento / Produto TI',
        codigo_sku: codigoSku,
        categoria,
        quantidade: Number(quantidade),
        preco_unitario: Number(precoUnitario),
        localizacao,
        minimo_alerta: Number(minimoAlerta)
      }

      await api.post('/stock', payload)
      alert('Item adicionado ao inventário de stock com sucesso!')

      setShowModal(false)
      setNome('')
      setCodigoSku('')
      setQuantidade(50)
      setPrecoUnitario(25000)

      loadData()
      loadKpis()
    } catch (error: unknown) {
      console.error(error)
      alert('Erro ao adicionar item ao stock.')
    } finally {
      setIsSaving(false)
    }
  }

  const filtered = items.filter(i => {
    const inome = i.nome || ''
    const isku = i.codigoSku || ''
    const matchSearch = String(i.produtoId || i.id).includes(search) || 
                        inome.toLowerCase().includes(search.toLowerCase()) ||
                        isku.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoriaFilter === 'TODOS' || i.categoria === categoriaFilter
    return matchSearch && matchCat
  })

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  return {
    items,
    loading,
    search,
    setSearch,
    categoriaFilter,
    setCategoriaFilter,
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    kpis,
    showModal,
    setShowModal,
    nome,
    setNome,
    codigoSku,
    setCodigoSku,
    categoria,
    setCategoria,
    quantidade,
    setQuantidade,
    precoUnitario,
    setPrecoUnitario,
    localizacao,
    setLocalizacao,
    minimoAlerta,
    setMinimoAlerta,
    isSaving,
    selectedForMovement,
    setSelectedForMovement,
    tipoMovimento,
    setTipoMovimento,
    qtdMovimento,
    setQtdMovimento,
    motivoMovimento,
    setMotivoMovimento,
    isSubmittingMovement,
    selectedForTransfer,
    setSelectedForTransfer,
    novoArmazem,
    setNovoArmazem,
    handleDelete,
    handleMovementSubmit,
    handleTransferSubmit,
    handleCreateSubmit,
    totalItems,
    totalPages,
    paginated,
  }
}
