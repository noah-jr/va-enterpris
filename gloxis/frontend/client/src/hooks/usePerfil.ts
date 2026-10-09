import React, { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../store/useAuth'
import { useNavigate } from 'react-router'

export interface PerfilData {
  id?: number
  fullName?: string
  nome?: string
  email?: string
  nif?: string
  telefone?: string
  endereco?: string | { rua?: string; numero?: string; cidade?: string; provincia?: string }
  contaBancaria?: string | { banco?: string; agencia?: string; conta?: string; iban?: string }
  fotografia?: string
  classificacao?: string
  isListaNegra?: boolean
}

export function usePerfil() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState<PerfilData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nome: '', nif: '', email: '', telefone: '', endereco: '', contaBancaria: '' })
  const [fotografia, setFotografia] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Change password
  const [showChangePw, setShowChangePw] = useState(false)
  const [pw, setPw] = useState({ atual: '', nova: '', confirmar: '' })
  const [changingPw, setChangingPw] = useState(false)
  const [pwFeedback, setPwFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    api.get('/clientes/me')
      .then((res: { data?: { data?: PerfilData } | PerfilData }) => {
        const resData = res.data
        if (!resData) return
        const d = ('data' in resData && resData.data ? resData.data : resData) as PerfilData
        setPerfil(d)

        let endStr = typeof d.endereco === 'string' ? d.endereco : ''
        try {
          if (typeof d.endereco === 'string' && d.endereco.startsWith('{')) {
            const p = JSON.parse(d.endereco)
            endStr = [p.rua, p.numero, p.cidade, p.provincia].filter(Boolean).join(', ')
          }
        } catch {}

        let contaStr = typeof d.contaBancaria === 'string' ? d.contaBancaria : ''
        try {
          if (typeof d.contaBancaria === 'string' && d.contaBancaria.startsWith('{')) {
            const p = JSON.parse(d.contaBancaria)
            contaStr = [p.banco && `Banco: ${p.banco}`, p.agencia && `Agência: ${p.agencia}`, p.conta && `Conta: ${p.conta}`, p.iban && `IBAN: ${p.iban}`].filter(Boolean).join(' | ')
          }
        } catch {}

        setForm({
          nome: d.fullName || d.nome || user?.fullName || '',
          nif: d.nif || '',
          email: d.email || user?.email || '',
          telefone: d.telefone || '',
          endereco: endStr,
          contaBancaria: d.contaBancaria && typeof d.contaBancaria === 'string' ? d.contaBancaria : contaStr,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFotografia(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)
    try {
      const fd = new FormData()
      fd.append('nome', form.nome)
      fd.append('nif', form.nif)
      fd.append('email', form.email)
      fd.append('telefone', form.telefone)
      fd.append('endereco', form.endereco)
      fd.append('contaBancaria', form.contaBancaria)
      if (fotografia) fd.append('fotografia', fotografia)

      const res = await api.put('/clientes/me', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const resData = res.data
      const updated = (resData && 'data' in resData && resData.data ? resData.data : resData) as PerfilData
      setPerfil(updated)
      setFotografia(null)
      setFeedback({ type: 'success', msg: 'Perfil actualizado com sucesso!' })
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } }
      setFeedback({ type: 'error', msg: errObj.response?.data?.message || 'Erro ao guardar alterações.' })
    } finally {
      setSaving(false)
    }
  }

  const handleSavePaymentDetails = async (newContaBancariaRaw: string) => {
    setSaving(true)
    setFeedback(null)
    try {
      const fd = new FormData()
      fd.append('contaBancaria', newContaBancariaRaw)
      const res = await api.put('/clientes/me', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const resData = res.data
      const updated = (resData && 'data' in resData && resData.data ? resData.data : resData) as PerfilData
      setPerfil(updated)
      setForm(f => ({ ...f, contaBancaria: newContaBancariaRaw }))
      setFeedback({ type: 'success', msg: 'Canais de pagamento actualizados com sucesso!' })
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } }
      setFeedback({ type: 'error', msg: errObj.response?.data?.message || 'Erro ao guardar canais de pagamento.' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwFeedback(null)
    if (pw.nova.length < 6) {
      setPwFeedback({ type: 'error', msg: 'A nova senha deve ter pelo menos 6 caracteres.' })
      return
    }
    if (pw.nova !== pw.confirmar) {
      setPwFeedback({ type: 'error', msg: 'As senhas não coincidem.' })
      return
    }
    setChangingPw(true)
    try {
      await api.post('/account/change-password', { currentPassword: pw.atual, newPassword: pw.nova })
      setPwFeedback({ type: 'success', msg: 'Senha alterada com sucesso!' })
      setPw({ atual: '', nova: '', confirmar: '' })
      setTimeout(() => setShowChangePw(false), 2000)
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } }
      setPwFeedback({ type: 'error', msg: errObj.response?.data?.message || 'Erro ao alterar a senha.' })
    } finally {
      setChangingPw(false)
    }
  }

  const handleLogout = async () => {
    try { await api.post('/account/logout') } catch {}
    logout()
    navigate('/login')
  }

  return {
    user,
    perfil,
    loading,
    saving,
    form,
    setForm,
    preview,
    feedback,
    showChangePw,
    setShowChangePw,
    pw,
    setPw,
    changingPw,
    pwFeedback,
    setPwFeedback,
    handlePhoto,
    handleSave,
    handleSavePaymentDetails,
    handleChangePw,
    handleLogout,
  }
}
