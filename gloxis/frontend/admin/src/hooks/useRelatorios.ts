import { useEffect, useState } from 'react'
import { api } from '../api/client'

export interface KPIHistoryItem {
  data: string
  vendas: number
  compras: number
  solicitacoes: number
  clientes: number
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
  erp?: {
    totalVendas: number
    valorTotalVendas: number
    totalCompras: number
    valorTotalCompras: number
    totalFuncionarios: number
    totalItensStock: number
  }
  history?: KPIHistoryItem[]
  geradoEm: string
}

export function useRelatorios() {
  const [kpis, setKpis] = useState<KPI | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [diasFilter, setDiasFilter] = useState<number>(30)

  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  const loadKpis = async (dias = diasFilter) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/relatorios/kpis?dias=${dias}`)
      const data = res.data?.data || res.data
      setKpis(data)
    } catch {
      setError('Não foi possível carregar os KPIs. Verifique a conexão.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKpis(diasFilter)
  }, [diasFilter])

  const openPdfPreview = async () => {
    setGeneratingPdf(true)
    try {
      const response = await api.get(`/relatorios/kpis/exportar-pdf?dias=${diasFilter}`, {
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      setPdfUrl(url)
      setShowPdfModal(true)
    } catch (err: unknown) {
      console.error('Erro ao gerar pré-visualização em PDF', err)
      alert('Erro ao carregar visualização interna do PDF.')
    } finally {
      setGeneratingPdf(false)
    }
  }

  const closePdfModal = () => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
    }
    setShowPdfModal(false)
  }

  const handleExportPDF = async () => {
    try {
      const response = await api.get(`/relatorios/kpis/exportar-pdf?dias=${diasFilter}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Relatorio_KPIs_Gloxis_${diasFilter}d.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    } catch (err: unknown) {
      console.error('Erro ao exportar PDF', err)
      alert('Erro ao exportar relatório PDF.')
    }
  }

  return {
    kpis,
    loading,
    error,
    diasFilter,
    setDiasFilter,
    loadKpis,
    pdfUrl,
    showPdfModal,
    generatingPdf,
    openPdfPreview,
    closePdfModal,
    handleExportPDF,
  }
}
