import { useEffect, useState } from 'react'
import { api } from '../api/client'

export interface Fatura {
  id: number
  tipoDocumento?: string
  valor?: number
  valorImposto?: number
  dataVencimento?: string
  created_at?: string
  status: string
}

export function useContabilidade() {
  const [faturas, setFaturas] = useState<Fatura[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get('/faturacao/me')
      .then((res: { data: unknown }) => {
        const d = res.data as Fatura[] | { data?: Fatura[] | { data?: Fatura[] } }
        let items: Fatura[] = []
        if (Array.isArray(d)) {
          items = d
        } else if (d?.data && Array.isArray(d.data)) {
          items = d.data
        } else if ('data' in d && d.data && typeof d.data === 'object' && 'data' in d.data && Array.isArray(d.data.data)) {
          items = d.data.data
        }
        setFaturas(items)
      })
      .catch(() => setError('Não foi possível carregar as faturas.'))
      .finally(() => setLoading(false))
  }, [])

  const totalPago = faturas.filter(f => f.status === 'PAGO').reduce((acc, f) => acc + Number(f.valor || 0), 0)
  const totalPendente = faturas.filter(f => f.status === 'PENDENTE').reduce((acc, f) => acc + Number(f.valor || 0), 0)
  const totalVencido = faturas.filter(f => f.status === 'VENCIDO').reduce((acc, f) => acc + Number(f.valor || 0), 0)

  const downloadPdf = (id: number) => {
    window.open(api.getApiUrl(`/faturacao/${id}/pdf`), '_blank')
  }

  return {
    faturas,
    loading,
    error,
    totalPago,
    totalPendente,
    totalVencido,
    downloadPdf,
  }
}
