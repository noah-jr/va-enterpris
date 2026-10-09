import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { api } from '../api/client'
import { useAuth } from '../store/useAuth'

export interface Produto {
  id: number
  nome: string
  taxaJurosMensal: number
  valorMinimo: number
  valorMaximo: number
  prazoMinimoMeses: number
  prazoMaximoMeses: number
}

export interface Documento {
  id: number
  titulo: string
  caminho: string
  clienteEmail?: string
  clienteNome?: string
}

export interface SimulacaoResult {
  valorParcelaMensal: number
  totalGeralPagar: number
  jurosTotalPagar: number
}

export function useSolicitarCredito() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [meusDocs, setMeusDocs] = useState<Documento[]>([])

  const [simulacao, setSimulacao] = useState<SimulacaoResult | null>(null)

  const [form, setForm] = useState({
    produtoId: '',
    valor: '',
    parcelas: '',
  })

  const [docSelecionadoId, setDocSelecionadoId] = useState<string>('')
  const [documentoFile, setDocumentoFile] = useState<File | null>(null)
  const [modoUploadDoc, setModoUploadDoc] = useState(false)

  const [loadingSimular, setLoadingSimular] = useState(false)
  const [loadingSolicitar, setLoadingSolicitar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Carregar produtos
    api.get('/produtos')
      .then((res: { data?: { data?: Produto[] } | Produto[] }) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || [])
        setProdutos(list)
      })
      .catch(() => {})

    // Carregar documentos do cliente
    if (user?.email) {
      api.get('/documentos', { params: { cliente_email: user.email, perPage: 100 } })
        .then((res: { data?: { data?: Documento[] } | Documento[] }) => {
          const all = Array.isArray(res.data) ? res.data : (res.data?.data || [])
          const myDocs = all.filter((d: Documento) => !d.clienteEmail || d.clienteEmail === user?.email || d.clienteNome === user?.fullName)
          setMeusDocs(myDocs)
          if (myDocs.length === 0) setModoUploadDoc(true)
        })
        .catch(() => {})
    }
  }, [user])

  const produto = produtos.find(p => p.id === Number(form.produtoId))

  const simular = async () => {
    if (!form.produtoId || !form.valor || !form.parcelas) {
      setError('Preencha todos os campos para simular.')
      return
    }
    setLoadingSimular(true)
    setError(null)
    try {
      const res = await api.post<SimulacaoResult>('/simulador', {
        produtoId: Number(form.produtoId),
        valor: Number(form.valor),
        parcelas: Number(form.parcelas),
      })
      setSimulacao(res.data)
      setStep(2)
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } }
      setError(errObj.response?.data?.message || 'Erro na simulação. Verifique os valores.')
    } finally {
      setLoadingSimular(false)
    }
  }

  const solicitar = async () => {
    if (!user) return
    if (modoUploadDoc && !documentoFile) {
      setError('Por favor, anexe uma cópia do seu documento de identificação.')
      return
    }
    if (!modoUploadDoc && !docSelecionadoId) {
      setError('Selecione um documento do seu arquivo ou faça upload de um novo.')
      return
    }

    setLoadingSolicitar(true)
    setError(null)
    try {
      const clienteRes = await api.get('/clientes/me')
      const meuCliente = ('data' in clienteRes.data && clienteRes.data.data ? clienteRes.data.data : clienteRes.data) as { id: number }

      if (!meuCliente || !meuCliente.id) {
        setError('Não encontrámos o seu perfil de cliente. Contacte o suporte.')
        return
      }

      // 1. Create Solicitacao
      const solRes = await api.post('/solicitacoes', {
        clienteId: meuCliente.id,
        produtoId: Number(form.produtoId),
        valor: Number(form.valor),
        parcelas: Number(form.parcelas),
      })

      const novaSolicitacaoId = ('data' in solRes.data && solRes.data.data ? solRes.data.data.id : solRes.data.id) as number

      // 2. Upload Document or link existing
      if (modoUploadDoc && documentoFile) {
        const formData = new FormData()
        formData.append('documento', documentoFile)
        formData.append('tipoDocumento', 'BILHETE_IDENTIDADE')

        await api.post(`/solicitacoes/${novaSolicitacaoId}/documentos`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else if (!modoUploadDoc && docSelecionadoId) {
        await api.post(`/inbox`, {
          assunto: `Anexo de Arquivo - Solicitação #${novaSolicitacaoId}`,
          conteudo: `O cliente vinculou o documento do seu arquivo (ID: ${docSelecionadoId}) à solicitação de crédito #${novaSolicitacaoId}.`,
          destinatario_nome: 'Departamento de Crédito',
          destinatario_tipo: 'ADMIN',
          remetente_nome: user.fullName,
          remetente_tipo: 'CLIENTE'
        })
      }

      setSuccess(true)
      setStep(3)
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string; error?: string } } }
      const msg = errObj.response?.data?.message || errObj.response?.data?.error || 'Erro ao enviar solicitação.'
      setError(msg.includes('LISTA_NEGRA')
        ? 'A sua conta está bloqueada para novos créditos. Contacte o suporte.'
        : msg
      )
    } finally {
      setLoadingSolicitar(false)
    }
  }

  const handleAddProdutoSuggestion = (text: string) => {
    alert(`O produto "${text}" não existe no nosso catálogo. Se deseja sugerir este novo produto, por favor envie-nos uma mensagem através da Consultoria.`)
  }

  return {
    navigate,
    user,
    step,
    setStep,
    produtos,
    meusDocs,
    simulacao,
    form,
    setForm,
    docSelecionadoId,
    setDocSelecionadoId,
    documentoFile,
    setDocumentoFile,
    modoUploadDoc,
    setModoUploadDoc,
    loadingSimular,
    loadingSolicitar,
    error,
    success,
    produto,
    simular,
    solicitar,
    handleAddProdutoSuggestion,
  }
}
