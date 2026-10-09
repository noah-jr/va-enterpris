import { useState } from 'react'
import { api } from '../api/client'

export interface SimularResultado {
  valorParcelaMensal: number
  totalGeralPagar: number
}

export function useSimulador() {
  const [valor, setValor] = useState(100000)
  const [parcelas, setParcelas] = useState(3)
  const [resultado, setResultado] = useState<SimularResultado | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSimular = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<SimularResultado>('/simulador', {
        produtoId: 1,
        valor,
        parcelas,
      })
      setResultado(res.data)
    } catch (err: unknown) {
      console.error(err)
      const errObj = err as { response?: { data?: { error?: string; message?: string } } }
      const msg = errObj.response?.data?.error || errObj.response?.data?.message || 'Erro ao simular. Verifique os valores inseridos.'
      setError(msg)
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  return {
    valor,
    setValor,
    parcelas,
    setParcelas,
    resultado,
    loading,
    error,
    handleSimular,
  }
}
