import { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'

export interface ParcelaData {
  id: number
  numeroParcela: number
  valorParcela: number
  dataVencimento?: string
  diasRestantes: number | null
  status: string
  atrasada?: boolean
  comprativoReembolsoPath?: string
  faturaParcelaId?: number
}

export interface TimelineResumo {
  parcelasPagas: number
  totalParcelas: number
  totalPago: number
  totalEmAberto: number
}

export interface TimelineSolicitacao {
  id: number
  dataInicioPagamento?: string
  dataVencimentoFinal?: string
  diasParaFim: number | null
  comprovativoDesembolsoPath?: string
  faturaDesembolsoId?: number
  faturaSolicitacaoId?: number
}

export interface TimelineData {
  resumo: TimelineResumo
  solicitacao: TimelineSolicitacao
  parcelas: ParcelaData[]
}

export interface CreditoItem {
  id: number
  valor: number
  parcelas: number
  finalidade?: string
  status: string
  createdAt?: string
  produto?: { nome?: string }
}

export function useMeusCreditos() {
  const [creditos, setCreditos] = useState<CreditoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('TODOS')

  const fetchCreditos = useCallback(() => {
    setLoading(true)
    api.get('/clientes/me')
      .then((res: { data?: { data?: { id?: number } } | { id?: number } }) => {
        const resData = res.data
        if (!resData) throw new Error('Cliente not found')
        const clienteData = ('data' in resData && resData.data ? resData.data : resData) as { id?: number }
        if (!clienteData?.id) throw new Error('Cliente not found')
        return api.get(`/clientes/${clienteData.id}/solicitacoes`)
      })
      .then((res: { data: unknown }) => {
        const d = res.data as CreditoItem[] | { data?: CreditoItem[] | { data?: CreditoItem[] } }
        let items: CreditoItem[] = []
        if (Array.isArray(d)) items = d
        else if (d && 'data' in d && Array.isArray(d.data)) items = d.data as CreditoItem[]
        else if (d && 'data' in d && d.data && typeof d.data === 'object' && 'data' in d.data && Array.isArray(d.data.data)) items = d.data.data as CreditoItem[]
        setCreditos(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchCreditos()
  }, [fetchCreditos])

  const filtered = filter === 'TODOS' ? creditos : creditos.filter((c: CreditoItem) => c.status === filter)

  return {
    creditos,
    loading,
    filter,
    setFilter,
    filtered,
    refresh: fetchCreditos,
  }
}

export function useCreditoTimeline(creditoId: number, expanded: boolean) {
  const [timeline, setTimeline] = useState<TimelineData | null>(null)
  const [loadingTimeline, setLoadingTimeline] = useState(false)

  const loadTimeline = useCallback(async () => {
    if (!expanded) return
    setLoadingTimeline(true)
    try {
      const res = await api.get(`/operacoes/solicitacoes/${creditoId}/parcelas`)
      const resData = res.data
      const data = (resData && 'data' in resData && resData.data ? resData.data : resData) as TimelineData
      setTimeline(data)
    } catch {
      setTimeline(null)
    } finally {
      setLoadingTimeline(false)
    }
  }, [creditoId, expanded])

  useEffect(() => {
    loadTimeline()
  }, [loadTimeline])

  return {
    timeline,
    loadingTimeline,
    loadTimeline,
  }
}
