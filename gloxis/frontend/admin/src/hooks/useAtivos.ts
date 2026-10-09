import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'

export type EstadoConservacao = 'EXCELENTE' | 'BOM' | 'REGULAR' | 'DANIFICADO' | 'ABATIDO'

export interface Ativo {
  id: number
  nome: string
  categoria: string
  localizacao: string
  responsavel: string | null
  valor: number
  estadoConservacao: EstadoConservacao
  taxaDepreciacaoAnual: number
  createdAt: string
}

export interface KpisAtivos {
  totalAtivos: number
  valorPatrimonialTotal: number
  ativosOperacionais: number
  depreciacaoAnualEstimada: number
}

export function useAtivos() {
  const [ativos, setAtivos] = useState<Ativo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('TODOS')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // KPIs
  const [kpis, setKpis] = useState<KpisAtivos>({
    totalAtivos: 0,
    valorPatrimonialTotal: 0,
    ativosOperacionais: 0,
    depreciacaoAnualEstimada: 0
  })

  // Modal Registar Ativo
  const [showModal, setShowModal] = useState(false)
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState('Equipamento Informático')
  const [localizacao, setLocalizacao] = useState('Sede Luanda - Piso 3')
  const [responsavel, setResponsavel] = useState('')
  const [valor, setValor] = useState(2500000)
  const [estadoConservacao, setEstadoConservacao] = useState<EstadoConservacao>('EXCELENTE')
  const [taxaDepreciacaoAnual, setTaxaDepreciacaoAnual] = useState(20)
  const [isSaving, setIsSaving] = useState(false)

  // Modal Manutenção & Revisão
  const [selectedForMaintenance, setSelectedForMaintenance] = useState<Ativo | null>(null)
  const [custoManutencao, setCustoManutencao] = useState(150000)
  const [notasManutencao, setNotasManutencao] = useState('Calibração periódica e substituição de consumíveis.')
  const [isSubmittingMaintenance, setIsSubmittingMaintenance] = useState(false)

  // Modal Alterar Estado de Conservação
  const [selectedForStatus, setSelectedForStatus] = useState<Ativo | null>(null)
  const [newEstado, setNewEstado] = useState<EstadoConservacao>('EXCELENTE')

  const loadData = useCallback(() => {
    setLoading(true)
    api.get('/ativos')
      .then(res => {
        const payload = res.data?.data !== undefined ? res.data.data : res.data
        const arrayData = Array.isArray(payload) ? payload : (payload?.data || [])
        setAtivos(arrayData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadKpis = useCallback(() => {
    api.get('/ativos/kpis')
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
    if (!window.confirm('Tem certeza que deseja abater / dar baixa deste bem patrimonial?')) return
    try {
      await api.delete(`/ativos/${id}`)
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao abater ativo.')
    }
  }

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedForMaintenance) return
    setIsSubmittingMaintenance(true)
    try {
      await api.put(`/ativos/${selectedForMaintenance.id}`, {
        estado_conservacao: 'REGULAR'
      })

      alert(`Manutenção preventiva registada para o ativo PAT-${selectedForMaintenance.id.toString().padStart(6, '0')} (Custo: Kz ${custoManutencao.toLocaleString('pt-AO')})!`)
      setSelectedForMaintenance(null)
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao registar manutenção.')
    } finally {
      setIsSubmittingMaintenance(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedForStatus) return
    try {
      await api.put(`/ativos/${selectedForStatus.id}`, { estado_conservacao: newEstado })
      alert(`Estado do ativo PAT-${selectedForStatus.id} alterado para ${newEstado}!`)
      setSelectedForStatus(null)
      loadData()
      loadKpis()
    } catch (error) {
      console.error(error)
      alert('Erro ao atualizar estado de conservação do ativo.')
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const payload = {
        nome: nome || 'Bem Imobilizado Gloxis',
        categoria,
        localizacao,
        responsavel: responsavel || 'Direção de TI & Operações',
        valor: Number(valor),
        estado_conservacao: estadoConservacao,
        taxa_depreciacao_anual: Number(taxaDepreciacaoAnual)
      }

      await api.post('/ativos', payload)
      alert('Bem Imobilizado tombado e registado no Ativo Fixo!')

      setShowModal(false)
      setNome('')
      setResponsavel('')
      setValor(2500000)

      loadData()
      loadKpis()
    } catch (error: unknown) {
      console.error(error)
      alert('Erro ao registar ativo.')
    } finally {
      setIsSaving(false)
    }
  }

  const filtered = ativos.filter(a => {
    const anome = a.nome || ''
    const aloc = a.localizacao || ''
    const aresp = a.responsavel || ''
    const matchSearch = String(a.id).includes(search) || 
                        anome.toLowerCase().includes(search.toLowerCase()) ||
                        aloc.toLowerCase().includes(search.toLowerCase()) ||
                        aresp.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'TODOS' || a.categoria === catFilter
    return matchSearch && matchCat
  })

  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  return {
    ativos,
    loading,
    search,
    setSearch,
    catFilter,
    setCatFilter,
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    kpis,
    showModal,
    setShowModal,
    nome,
    setNome,
    categoria,
    setCategoria,
    localizacao,
    setLocalizacao,
    responsavel,
    setResponsavel,
    valor,
    setValor,
    estadoConservacao,
    setEstadoConservacao,
    taxaDepreciacaoAnual,
    setTaxaDepreciacaoAnual,
    isSaving,
    selectedForMaintenance,
    setSelectedForMaintenance,
    custoManutencao,
    setCustoManutencao,
    notasManutencao,
    setNotasManutencao,
    isSubmittingMaintenance,
    selectedForStatus,
    setSelectedForStatus,
    newEstado,
    setNewEstado,
    handleDelete,
    handleMaintenanceSubmit,
    handleUpdateStatus,
    handleCreateSubmit,
    filtered,
    totalItems,
    totalPages,
    paginated,
  }
}
