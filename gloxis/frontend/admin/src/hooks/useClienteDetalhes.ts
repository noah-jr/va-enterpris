import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { api } from '../api/client'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import { 
  useClienteDetailQuery, 
  useUpdateClienteMutation, 
  useCreateCreditoMutation, 
  useCreateFaturaMutation 
} from './queries/useAdminQueries'

export interface Credito {
  id: number
  valor: string | number
  parcelas: number
  status: string
  finalidade?: string
  created_at?: string
  createdAt?: string
  [key: string]: unknown
}

export interface Fatura {
  id: number
  numero_fatura?: string
  numeroFatura?: string
  valor_total?: string | number
  valorTotal?: string | number
  created_at?: string
  createdAt?: string
  [key: string]: unknown
}

export interface Mensagem {
  id: number
  remetente_nome?: string
  assunto: string
  conteudo: string
  created_at?: string
  createdAt?: string
  [key: string]: unknown
}

export interface Cliente {
  id: number
  nome: string
  nif: string
  email?: string
  telefone?: string
  endereco?: string
  contaBancaria?: string
  conta_bancaria?: string
  fotografia?: string
  logotipo?: string
  scoreCredito: number
  score_credito?: number
  isListaNegra?: boolean
  is_lista_negra?: boolean
  risco: 'BAIXO' | 'MEDIO' | 'ALTO'
  isOnline?: boolean
  createdAt: string
  created_at: string
  creditos?: Credito[]
  faturas?: Fatura[]
  mensagens?: Mensagem[]
}

export function useClienteDetalhes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const { data: cliente = null, isLoading: loading, refetch: loadProfile } = useClienteDetailQuery(id)

  const updateMutation = useUpdateClienteMutation(id || 0)
  const createCreditoMutation = useCreateCreditoMutation()
  const createFaturaMutation = useCreateFaturaMutation()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<{
    nome: string
    nif: string
    email: string
    telefone: string
    endereco: string
    contaBancaria: string
    fotografiaFile?: File
    logotipoFile?: File
  }>({ nome: '', nif: '', email: '', telefone: '', endereco: '', contaBancaria: '' })

  // Modais de Operação Rápida
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [creditValor, setCreditValor] = useState(3000000)
  const [creditParcelas, setCreditParcelas] = useState(12)
  const [creditFinalidade, setCreditFinalidade] = useState('Expansão Comercial / Equipamento')

  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceValor, setInvoiceValor] = useState(500000)
  const [invoiceDescricao, setInvoiceDescricao] = useState('Prestação de Serviços de Consultoria de Crédito')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      const payload = new FormData()
      payload.append('nome', formData.nome)
      payload.append('nif', formData.nif)
      payload.append('email', formData.email)
      payload.append('telefone', formData.telefone)
      payload.append('endereco', formData.endereco)
      payload.append('contaBancaria', formData.contaBancaria)
      if (formData.fotografiaFile) payload.append('fotografia', formData.fotografiaFile)
      if (formData.logotipoFile) payload.append('logotipo', formData.logotipoFile)

      await updateMutation.mutateAsync(payload)
      setIsEditing(false)
    } catch (err: unknown) {
      console.error(err)
      const msg = (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error || (err as { message?: string }).message
      alert("Erro ao guardar cliente: " + msg)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (confirm("Tem a certeza que deseja remover este cliente?")) {
      try {
        await api.delete(`/clientes/${id}`)
        queryClient.invalidateQueries({ queryKey: queryKeys.clientes.all })
        navigate('/clientes')
      } catch (err) {
        console.error(err)
        alert("Erro ao remover cliente")
      }
    }
  }

  const handleCreateCredit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cliente) return
    try {
      await createCreditoMutation.mutateAsync({
        clienteId: cliente.id,
        valor: Number(creditValor),
        parcelas: Number(creditParcelas),
        finalidade: creditFinalidade
      })
      alert(`Solicitação de Crédito de Kz ${creditValor.toLocaleString('pt-AO')} registada com sucesso para ${cliente.nome}!`)
      setShowCreditModal(false)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error || (err as { message?: string }).message
      alert("Erro ao submeter crédito: " + msg)
    }
  }

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cliente) return

    if (!cliente.nif || cliente.nif.length < 9) {
      alert("Erro: O cliente não tem um NIF válido para emissão de fatura certificada (AGT). Atualize o perfil do cliente primeiro.")
      return
    }

    try {
      await createFaturaMutation.mutateAsync({
        clienteId: cliente.id,
        valorTotal: Number(invoiceValor),
        descricao: invoiceDescricao
      })
      alert(`Fatura emitida e comunicada com sucesso (NIF: ${cliente.nif}) para ${cliente.nome}!`)
      setShowInvoiceModal(false)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } }; message?: string })?.response?.data?.error || (err as { message?: string }).message
      alert("Erro ao emitir fatura: " + msg)
    }
  }

  const openEditForm = () => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || '',
        nif: cliente.nif || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        endereco: cliente.endereco || '',
        contaBancaria: cliente.contaBancaria || cliente.conta_bancaria || ''
      })
      setIsEditing(true)
    }
  }

  return {
    id,
    navigate,
    cliente,
    loading,
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    showCreditModal,
    setShowCreditModal,
    creditValor,
    setCreditValor,
    creditParcelas,
    setCreditParcelas,
    creditFinalidade,
    setCreditFinalidade,
    isSubmittingCredit: createCreditoMutation.isPending,
    showInvoiceModal,
    setShowInvoiceModal,
    invoiceValor,
    setInvoiceValor,
    invoiceDescricao,
    setInvoiceDescricao,
    isSubmittingInvoice: createFaturaMutation.isPending,
    loadProfile,
    handleSave,
    handleDelete,
    handleCreateCredit,
    handleCreateInvoice,
    openEditForm,
  }
}
