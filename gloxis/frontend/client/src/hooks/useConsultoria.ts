import React, { useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../store/useAuth'

export function useConsultoria() {
  const { user } = useAuth()
  const [tipo, setTipo] = useState('')
  const [assunto, setAssunto] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!tipo) {
      setError('Selecione o tipo de consultoria.')
      return
    }
    setEnviando(true)
    try {
      const conteudo = `
Tipo: ${tipo}
Assunto: ${assunto}
${data ? `Data Preferida: ${data} ${hora}` : ''}

Descrição:
${descricao}
      `.trim()

      await api.post('/inbox', {
        assunto: `[CONSULTORIA] ${assunto}`,
        conteudo,
        destinatario_nome: 'Administração Gloxis',
        destinatario_tipo: 'ADMIN',
        remetente_nome: user?.fullName || 'Cliente',
        remetente_tipo: 'CLIENTE',
      })
      setSuccess(true)
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } }
      setError(errObj.response?.data?.message || 'Erro ao submeter pedido. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return {
    tipo,
    setTipo,
    assunto,
    setAssunto,
    descricao,
    setDescricao,
    data,
    setData,
    hora,
    setHora,
    enviando,
    success,
    setSuccess,
    error,
    handleSubmit,
  }
}
