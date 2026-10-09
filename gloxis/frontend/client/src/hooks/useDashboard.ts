import { useEffect, useState } from 'react'
import { api } from '../api/client'

export interface ParcelaInfo {
  valor: number
  numeroParcela: number
  vencimento: string
}

export interface PagamentoInfo {
  numeroParcela: number
  totalParcelas: number
  dataPagamento: string
  valorPago: number
}

export interface ClassificacaoInfo {
  nivel: string
  pontosFidelidade: number
  diasMediosAtraso: number
}

export interface DashboardData {
  saldoDevedor: number
  proximaParcela?: ParcelaInfo
  ultimosPagamentos: PagamentoInfo[]
  classificacao?: ClassificacaoInfo
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/clientes/me/dashboard')
      .then((res: { data?: { data?: DashboardData } | DashboardData }) => {
        const resData = res.data
        if (!resData) return
        const payload = ('data' in resData && resData.data ? resData.data : resData) as DashboardData
        setData(payload)
      })
      .catch(() => setError('Não foi possível carregar os dados do dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  return {
    data,
    loading,
    error,
  }
}
