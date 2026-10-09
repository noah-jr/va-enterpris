import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'

export type TipoMovimento = 'RECEITA' | 'DESPESA' | 'TRANSF'

export interface FinanceiroItem {
  id: number
  solicitacaoId: number | null
  descricao: string | null
  tipo: TipoMovimento
  categoria: string
  entidadeNome: string | null
  contaBancaria: string
  valorPago: number
  metodo: string
  status: string
  createdAt: string
}

export interface KpisFinanceiro {
  receitaTotal: number
  despesaTotal: number
  saldoTesouraria: number
  totalTransacoes: number
}

export function useFinanceiro() {
  const [lancamentos, setLancamentos] = useState<FinanceiroItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState('TODOS')

  // KPIs
  const [kpis, setKpis] = useState<KpisFinanceiro>({
    receitaTotal: 0,
    despesaTotal: 0,
    saldoTesouraria: 0,
    totalTransacoes: 0
  })

  // Modal Novo Lançamento
  const [showModal, setShowModal] = useState(false)
  const [descricao, setDescricao] = useState('')
  const [tipo, setTipo] = useState<TipoMovimento>('RECEITA')
  const [categoria, setCategoria] = useState('OPERACIONAL')
  const [entidadeNome, setEntidadeNome] = useState('')
  const [contaBancaria, setContaBancaria] = useState('BFA - Conta Corrente Principal')
  const [valorPago, setValorPago] = useState(150000)
  const [metodo, setMetodo] = useState('TRANSFERENCIA')
  const [isSaving, setIsSaving] = useState(false)

  const loadData = useCallback(() => {
    setLoading(true)
    api.get('/financeiro')
      .then(res => {
        const payload = res.data?.data !== undefined ? res.data.data : res.data
        const arrayData = Array.isArray(payload) ? payload : (payload?.data || [])
        setLancamentos(arrayData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadKpis = useCallback(() => {
    api.get('/financeiro/kpis')
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
    if (!window.confirm('Tem certeza que deseja estornar este lançamento financeiro?')) return
    try {
      await api.delete(`/financeiro/${id}`)
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao estornar lançamento.')
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const payload = {
        descricao: descricao || 'Movimentação de Tesouraria',
        tipo,
        categoria,
        entidade_nome: entidadeNome || 'Entidade Financeira Geral',
        conta_bancaria: contaBancaria,
        valor_pago: Number(valorPago),
        metodo,
        status: 'CONCLUIDO'
      }

      await api.post('/financeiro', payload)
      alert('Lançamento financeiro efetuado com sucesso!')

      setShowModal(false)
      setDescricao('')
      setEntidadeNome('')
      setValorPago(150000)

      loadData()
      loadKpis()
    } catch (error: unknown) {
      console.error(error)
      alert('Erro ao criar lançamento financeiro.')
    } finally {
      setIsSaving(false)
    }
  }

  const filtered = lancamentos.filter(l => {
    const desc = l.descricao || ''
    const ent = l.entidadeNome || ''
    const matchSearch = String(l.id).includes(search) || 
                        desc.toLowerCase().includes(search.toLowerCase()) ||
                        ent.toLowerCase().includes(search.toLowerCase())
    const matchTipo = tipoFilter === 'TODOS' || l.tipo === tipoFilter
    return matchSearch && matchTipo
  })

  return {
    lancamentos,
    loading,
    search,
    setSearch,
    tipoFilter,
    setTipoFilter,
    kpis,
    showModal,
    setShowModal,
    descricao,
    setDescricao,
    tipo,
    setTipo,
    categoria,
    setCategoria,
    entidadeNome,
    setEntidadeNome,
    contaBancaria,
    setContaBancaria,
    valorPago,
    setValorPago,
    metodo,
    setMetodo,
    isSaving,
    loadData,
    loadKpis,
    handleDelete,
    handleCreateSubmit,
    filtered,
  }
}
