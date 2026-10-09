import { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'
import { useAuth } from '../store/useAuth'
import type { MensagemInbox } from '../types'

export function useInbox() {
  const { user } = useAuth()
  const [mensagens, setMensagens] = useState<MensagemInbox[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<MensagemInbox | null>(null)
  const [assunto, setAssunto] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [anexo, setAnexo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const carregar = useCallback(() => {
    setLoading(true)
    api.get('/inbox/me')
      .then((res: { data: unknown }) => {
        const d = res.data as MensagemInbox[] | { data?: MensagemInbox[] | { data?: MensagemInbox[] } }
        let items: MensagemInbox[] = []
        if (Array.isArray(d)) {
          items = d
        } else if (d?.data && Array.isArray(d.data)) {
          items = d.data
        } else if ('data' in d && d.data && typeof d.data === 'object' && 'data' in d.data && Array.isArray(d.data.data)) {
          items = d.data.data
        }
        setMensagens(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const marcarLida = async (msg: MensagemInbox) => {
    if (!msg.lida) {
      try {
        await api.put(`/inbox/${msg.id}/lida`)
      } catch {}
      setMensagens(prev => prev.map(m => m.id === msg.id ? { ...m, lida: 1 } : m))
    }
    setSelected(msg)
  }

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!assunto.trim() || !conteudo.trim()) {
      setError('Preencha o assunto e o conteúdo.')
      return
    }
    setEnviando(true)
    try {
      const fd = new FormData()
      fd.append('assunto', assunto)
      fd.append('conteudo', conteudo)
      fd.append('destinatario_nome', 'Administração Gloxis')
      fd.append('destinatario_tipo', 'ADMIN')
      fd.append('remetente_nome', user?.fullName || 'Cliente')
      fd.append('remetente_tipo', 'CLIENTE')
      if (anexo) fd.append('arquivo', anexo)

      await api.post('/inbox', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setShowModal(false)
      setAssunto('')
      setConteudo('')
      setAnexo(null)
      carregar()
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } }
      setError(errObj.response?.data?.message || 'Erro ao enviar mensagem.')
    } finally {
      setEnviando(false)
    }
  }

  const unreadCount = mensagens.filter(m => !m.lida).length

  return {
    user,
    mensagens,
    loading,
    showModal,
    setShowModal,
    selected,
    setSelected,
    assunto,
    setAssunto,
    conteudo,
    setConteudo,
    anexo,
    setAnexo,
    enviando,
    error,
    setError,
    carregar,
    marcarLida,
    handleEnviar,
    unreadCount,
  }
}
