import { useState } from 'react'
import { api } from '../api/client'
import { useDashboardKPIsQuery } from './queries/useAdminQueries'

export interface KPIHistoryItem {
  data: string
  vendas?: number
  compras?: number
  clientes?: number
  solicitacoes?: number
  [key: string]: number | string | undefined
}

export interface KPI {
  totalClientes: number
  clientesAtivos: number
  clientesNaListaNegra: number
  solicitacoesTotal: number
  solicitacoesAprovadas: number
  solicitacoesReprovadas: number
  solicitacoesPendentes: number
  taxaAprovacao: number
  totalDesembolsado: number
  totalRecebidoPagamentos: number
  totalJurosRecebidos: number
  saldoCarteiraTotalDevedor: number
  totalClientesInadimplentes: number
  valorTotalAtrasado: number
  taxaInadimplencia: number
  history?: KPIHistoryItem[]
  erp?: {
    totalVendas: number
    valorTotalVendas: number
    totalCompras: number
    valorTotalCompras: number
    totalFuncionarios: number
    totalItensStock: number
  }
  geradoEm: string
}

export interface SolicitacaoItem {
  id: number
  valor: number
  status: string
}

export interface VendaItem {
  id: number
  valor: number
  status: string
}

export function useDashboard() {
  const [diasFiltro, setDiasFiltro] = useState<number>(30)

  const { data, isLoading: loading, isError } = useDashboardKPIsQuery(diasFiltro)

  const kpis = data?.kpis || null
  const recentes = data?.recentes || []
  const vendas = data?.vendas || []
  const error = isError ? 'Não foi possível carregar os dados do Dashboard. Verifique a conexão.' : null

  const handleExportPDF = async () => {
    try {
      const response = await api.get(`/relatorios/kpis/exportar-pdf?dias=${diasFiltro}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Relatorio_KPIs.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    } catch (err: unknown) {
      console.error('Erro ao exportar PDF', err)
      alert('Erro ao exportar relatório PDF.')
    }
  }

  const mainChartData = kpis?.history ? kpis.history.map(item => ({
    mes: item.data,
    receitas: item.vendas || 0,
    despesas: item.compras || 0,
  })) : []

  return {
    kpis,
    loading,
    error,
    recentes,
    vendas,
    diasFiltro,
    setDiasFiltro,
    handleExportPDF,
    mainChartData,
  }
}
