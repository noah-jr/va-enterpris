import { useEffect, useState, useRef, useCallback } from 'react'
import { api } from '../api/client'
import { useFileUrl } from '../hooks/useFileUrl'
import { PaginationControl } from '../components/PaginationControl'
import { 
  FileText, Search, Trash2, Download, Send, Share2, 
  Clock, ArrowRight, Inbox, Mail, 
  X, Filter, Tag, Paperclip, MessageSquare, User, Building2, 
  MessageCircle, SendHorizontal, FileUp
} from 'lucide-react'

interface Documento {
  id: number
  titulo: string
  caminho: string
  categoria: string
  departamento: string
  status: string
  clienteNome: string | null
  clienteEmail: string | null
  notas: string | null
  createdAt: string
  tramitacoes?: any[]
}

interface MensagemInbox {
  id: number
  remetenteNome: string
  remetenteTipo: string
  destinatarioNome: string
  destinatarioTipo: string
  assunto: string
  conteudo: string
  documentoId: number | null
  lida: boolean
  createdAt: string
}

export function Documentos() {
  const { getFileUrl } = useFileUrl()
  const [activeTab, setActiveTab] = useState<'documentos' | 'editor' | 'inbox'>('documentos')
  const [inboxSubTab, setInboxSubTab] = useState<'chat' | 'formulario'>('chat')

  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [mensagens, setMensagens] = useState<MensagemInbox[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filtros Documentos
  const [search, setSearch] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('TODOS')
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Chat State
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [chatReplyText, setChatReplyText] = useState('')
  const [chatReplyDocId, setChatReplyDocId] = useState<string>('')
  const [isSendingReply, setIsSendingReply] = useState(false)

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadData, setUploadData] = useState({
    titulo: '',
    categoria: 'KYC',
    departamento: 'GERAL',
    cliente_nome: '',
    cliente_email: '',
    notas: ''
  })
  const [isUploading, setIsUploading] = useState(false)

  // Tramitar Modal State
  const [selectedDocForTramitacao, setSelectedDocForTramitacao] = useState<Documento | null>(null)
  const [tramitacaoData, setTramitacaoData] = useState({
    destino: 'FINANCEIRO',
    status_novo: 'EM_ANALISE',
    despacho: '',
    usuario: 'Administrador'
  })
  const [isTramitando, setIsTramitando] = useState(false)

  // Partilhar Modal State (Email & SMS)
  const [selectedDocForShare, setSelectedDocForShare] = useState<Documento | null>(null)
  const [shareType, setShareType] = useState<'email' | 'mensagem'>('email')
  const [shareData, setShareData] = useState({
    email_destino: '',
    telefone_ou_canal: '',
    destinatario_nome: '',
    assunto: '',
    mensagem: ''
  })
  const [isSendingShare, setIsSendingShare] = useState(false)

  // Histórico Modal State
  const [selectedDocHistory, setSelectedDocHistory] = useState<Documento | null>(null)

  // Formulario Nova Mensagem State
  const [newMsgData, setNewMsgData] = useState({
    destinatario_nome: '',
    destinatario_tipo: 'CLIENTE',
    assunto: '',
    conteudo: '',
    documento_id: ''
  })
  const [isSendingMsg, setIsSendingMsg] = useState(false)

  const loadInbox = useCallback(() => {
    api.get('/inbox')
      .then(res => {
        const payload = res.data.data !== undefined ? res.data.data : res.data
        const arrayMsgs: MensagemInbox[] = Array.isArray(payload) ? payload : []
        setMensagens(arrayMsgs)
        if (arrayMsgs.length > 0 && !selectedContact) {
          setSelectedContact(arrayMsgs[0].destinatarioNome || arrayMsgs[0].remetenteNome)
        }
      })
      .catch(err => console.error("Failed to load inbox:", err))
  }, [selectedContact])

  const loadData = useCallback(() => {
    setLoading(true)
    api.get('/documentos')
      .then(res => {
        const payload = res.data.data !== undefined ? res.data.data : res.data
        const arrayDocs: Documento[] = Array.isArray(payload) ? payload : []
        setDocumentos(arrayDocs)
      })
      .catch(err => console.error("Failed to load documentos:", err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
    loadInbox()
  }, [loadData, loadInbox])

  // ==== UPLOAD SUBMISSION ====
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      if (!uploadData.titulo) {
        setUploadData(prev => ({ ...prev, titulo: file.name }))
      }
    }
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      alert('Por favor selecione um ficheiro para submeter.')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('documento', selectedFile)
    formData.append('titulo', uploadData.titulo)
    formData.append('categoria', uploadData.categoria)
    formData.append('departamento', uploadData.departamento)
    formData.append('cliente_nome', uploadData.cliente_nome)
    formData.append('cliente_email', uploadData.cliente_email)
    formData.append('notas', uploadData.notas)

    try {
      await api.post('/documentos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('Documento submetido com sucesso para o arquivo digital!')
      setShowUploadModal(false)
      setSelectedFile(null)
      setUploadData({ titulo: '', categoria: 'KYC', departamento: 'GERAL', cliente_nome: '', cliente_email: '', notas: '' })
      loadData()
    } catch (error: any) {
      alert('Erro ao submeter documento: ' + (error.response?.data?.error || error.message))
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja eliminar este documento do arquivo digital?')) return
    try {
      await api.delete(`/documentos/${id}`)
      loadData()
    } catch (error: any) {
      alert('Erro ao eliminar: ' + (error.response?.data?.error || error.message))
    }
  }

  // ==== TRAMITACAO SUBMISSION ====
  const handleTramitarSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDocForTramitacao) return

    setIsTramitando(true)
    try {
      const res = await api.post(`/documentos/${selectedDocForTramitacao.id}/tramitar`, tramitacaoData)
      alert(res.data.message || 'Documento tramitado com sucesso!')
      setSelectedDocForTramitacao(null)
      loadData()
    } catch (error: any) {
      alert('Erro ao tramitar documento: ' + (error.response?.data?.error || error.message))
    } finally {
      setIsTramitando(false)
    }
  }

  // ==== SHARE SUBMISSION (EMAIL / SMS) ====
  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDocForShare) return

    setIsSendingShare(true)
    try {
      const endpoint = shareType === 'email' 
        ? `/documentos/${selectedDocForShare.id}/enviar-email` 
        : `/documentos/${selectedDocForShare.id}/enviar-mensagem`

      const res = await api.post(endpoint, shareData)
      alert(res.data.message || 'Documento enviado com sucesso!')
      setSelectedDocForShare(null)
      loadInbox()
    } catch (error: any) {
      alert('Erro ao enviar: ' + (error.response?.data?.error || error.message))
    } finally {
      setIsSendingShare(false)
    }
  }

  // ==== FORMULARIO INBOX SUBMISSION ====
  const handleSendInboxMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSendingMsg(true)
    try {
      await api.post('/inbox', {
        ...newMsgData,
        documento_id: newMsgData.documento_id ? Number(newMsgData.documento_id) : null
      })
      alert('Mensagem enviada com sucesso para o destinatário!')
      setNewMsgData({ destinatario_nome: '', destinatario_tipo: 'CLIENTE', assunto: '', conteudo: '', documento_id: '' })
      loadInbox()
      setInboxSubTab('chat')
    } catch (error: any) {
      alert('Erro ao enviar mensagem: ' + (error.response?.data?.error || error.message))
    } finally {
      setIsSendingMsg(false)
    }
  }

  // ==== QUICK CHAT REPLY SUBMISSION ====
  const handleSendChatReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContact || (!chatReplyText.trim() && !chatReplyDocId)) return

    setIsSendingReply(true)
    try {
      await api.post('/inbox', {
        remetente_nome: 'Administrador',
        remetente_tipo: 'ADMIN',
        destinatario_nome: selectedContact,
        destinatario_tipo: 'CLIENTE',
        assunto: `Resposta Direta para ${selectedContact}`,
        conteudo: chatReplyText || 'Documento anexado à conversa.',
        documento_id: chatReplyDocId ? Number(chatReplyDocId) : null
      })
      setChatReplyText('')
      setChatReplyDocId('')
      loadInbox()
    } catch (error: any) {
      alert('Erro ao enviar mensagem de chat: ' + (error.response?.data?.error || error.message))
    } finally {
      setIsSendingReply(false)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/inbox/${id}/lida`)
      loadInbox()
    } catch (err) {
      console.error(err)
    }
  }

  // Filtered documents
  const filteredDocs = documentos.filter(d => {
    const matchSearch = d.titulo.toLowerCase().includes(search.toLowerCase()) ||
                        (d.clienteNome && d.clienteNome.toLowerCase().includes(search.toLowerCase())) ||
                        (d.departamento && d.departamento.toLowerCase().includes(search.toLowerCase()))
    
    const matchCat = filtroCategoria === 'TODOS' || d.categoria === filtroCategoria
    const matchStatus = filtroStatus === 'TODOS' || d.status === filtroStatus
    return matchSearch && matchCat && matchStatus
  })

  const totalItems = filteredDocs.length
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const paginatedDocs = filteredDocs.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Group messages by Contact for Chat Sidebar
  const contactsMap = new Map<string, MensagemInbox[]>()
  mensagens.forEach(msg => {
    const contact = msg.destinatarioTipo === 'CLIENTE' ? msg.destinatarioNome : msg.remetenteNome
    if (!contactsMap.has(contact)) {
      contactsMap.set(contact, [])
    }
    contactsMap.get(contact)!.push(msg)
  })

  const contactsList = Array.from(contactsMap.keys())
  const activeChatMessages = selectedContact ? (contactsMap.get(selectedContact) || []) : []
  const unreadMessagesCount = mensagens.filter(m => !m.lida).length

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-zinc-800 dark:text-zinc-200" /> Gestão Documental & Repositório Digital
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
            Repositório digital, tramitação de expediente, comunicação direta e partilha de ficheiros institucionais.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 px-3 py-1.5 font-semibold transition-colors shadow-2xs text-xs cursor-pointer"
          >
            <FileUp className="w-3.5 h-3.5" /> Submeter Documento
          </button>
        </div>
      </div>

      {/* TOP MAIN TABS CONTROL */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('documentos')}
          className={`pb-3 font-bold text-xs transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'documentos' 
              ? 'text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white' 
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Arquivo & Tramitações
          <span className="px-2 py-0.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-200 dark:border-zinc-700">
            {documentos.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('inbox')}
          className={`pb-3 font-bold text-xs transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'inbox' 
              ? 'text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white' 
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" /> Inbox de Comunicação (Chat & Formulário)
          {unreadMessagesCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] bg-rose-600 text-white font-bold">
              {unreadMessagesCount} novas
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ARQUIVO & TRAMITAÇÕES */}
      {activeTab === 'documentos' && (
        <div className="space-y-4">
          
          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white dark:bg-zinc-900 p-3.5 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col md:flex-row gap-3 justify-between items-center">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar por título, cliente ou departamento..." 
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 pl-9 pr-3.5 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors placeholder:text-zinc-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                <select 
                  value={filtroCategoria}
                  onChange={e => setFiltroCategoria(e.target.value)}
                  className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 px-3 py-1.5 focus:outline-none focus:border-zinc-900 dark:focus:border-white cursor-pointer"
                >
                  <option value="TODOS">Todas Categorias</option>
                  <option value="KYC">KYC & Identificação</option>
                  <option value="CONTRATO">Contratos</option>
                  <option value="FATURA">Faturas & Recibos</option>
                  <option value="RELATORIO">Relatórios</option>
                  <option value="OUTRO">Outros</option>
                </select>
              </div>

              <select 
                value={filtroStatus}
                onChange={e => setFiltroStatus(e.target.value)}
                className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 px-3 py-1.5 focus:outline-none focus:border-zinc-900 dark:focus:border-white cursor-pointer"
              >
                <option value="TODOS">Todos os Estados</option>
                <option value="PENDENTE">Pendente</option>
                <option value="EM_ANALISE">Em Análise</option>
                <option value="APROVADO">Aprovado</option>
                <option value="REJEITADO">Rejeitado</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>
            </div>
          </div>

          {/* TABLE OF DOCUMENTS */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-2.5">Documento / Título</th>
                    <th className="px-4 py-2.5">Categoria</th>
                    <th className="px-4 py-2.5">Departamento Atual</th>
                    <th className="px-4 py-2.5">Estado</th>
                    <th className="px-4 py-2.5">Cliente Relacionado</th>
                    <th className="px-4 py-2.5 text-right">Ações & Tramitação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                        <div className="flex justify-center"><div className="w-5 h-5 border-2 border-zinc-900 dark:border-white border-t-transparent animate-spin" /></div>
                      </td>
                    </tr>
                  ) : paginatedDocs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                        <FileText className="w-7 h-7 mx-auto mb-1.5 opacity-40 text-zinc-400" />
                        Nenhum documento encontrado no arquivo digital.
                      </td>
                    </tr>
                  ) : paginatedDocs.map(d => (
                    <tr key={d.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors">
                      
                      {/* Titulo */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shrink-0 text-zinc-700 dark:text-zinc-300">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-white text-xs">{d.titulo}</p>
                            <p className="text-[10px] text-zinc-400 font-mono truncate max-w-xs">{d.caminho}</p>
                          </div>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                          <Tag className="w-3 h-3 text-zinc-500 dark:text-zinc-400" /> {d.categoria}
                        </span>
                      </td>

                      {/* Departamento */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-zinc-400" /> {d.departamento}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold border ${
                          d.status === 'APROVADO' || d.status === 'CONCLUIDO' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                          d.status === 'REJEITADO' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' :
                          d.status === 'EM_ANALISE' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' :
                          'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                        }`}>
                          {d.status}
                        </span>
                      </td>

                      {/* Cliente */}
                      <td className="px-4 py-3 text-xs">
                        {d.clienteNome ? (
                          <div>
                            <p className="text-zinc-900 dark:text-white font-medium flex items-center gap-1"><User className="w-3 h-3 text-zinc-400" /> {d.clienteNome}</p>
                            <p className="text-[10px] text-zinc-400">{d.clienteEmail || 'Sem email'}</p>
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic text-[11px]">Uso Interno</span>
                        )}
                      </td>

                      {/* Acoes */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Tramitar Button */}
                          <button 
                            onClick={() => setSelectedDocForTramitacao(d)}
                            className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                            title="Tramitar / Encaminhar Departamento"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Share (Email / SMS) Button */}
                          <button 
                            onClick={() => {
                              setSelectedDocForShare(d)
                              setShareData({
                                email_destino: d.clienteEmail || '',
                                telefone_ou_canal: '',
                                destinatario_nome: d.clienteNome || '',
                                assunto: `Envio de Documento: ${d.titulo}`,
                                mensagem: `Exmo(a) ${d.clienteNome || 'Cliente'},\n\nSegue em anexo o documento "${d.titulo}".`
                              })
                            }}
                            className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                            title="Partilhar por E-mail ou Mensagem"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Ver Histórico */}
                          <button 
                            onClick={() => {
                              api.get(`/documentos/${d.id}`).then(res => {
                                setSelectedDocHistory(res.data.data)
                              })
                            }}
                            className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                            title="Histórico de Despachos"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          {/* Download Direct */}
                          <a 
                            href={getFileUrl(d.caminho)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                            title="Download Ficheiro"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          {/* Delete */}
                          <button onClick={() => handleDelete(d.id)} className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              perPage={perPage}
              onPageChange={setCurrentPage}
              onPerPageChange={p => { setPerPage(p); setCurrentPage(1); }}
            />
          </div>

        </div>
      )}

      {/* TAB 2: INBOX (CHAT + FORMULÁRIO) */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          
          {/* SUB-TABS: CHAT vs FORMULÁRIO */}
          <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 p-1.5 border border-zinc-200 dark:border-zinc-700">
            <div className="flex gap-1.5">
              <button 
                onClick={() => setInboxSubTab('chat')}
                className={`px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  inboxSubTab === 'chat' 
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xs' 
                    : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" /> Chat de Conversas (Tempo Real)
              </button>

              <button 
                onClick={() => setInboxSubTab('formulario')}
                className={`px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  inboxSubTab === 'formulario' 
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xs' 
                    : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Formulário de Nova Mensagem / Ticket
              </button>
            </div>
          </div>

          {/* VISTA 1: CHAT INTERACTIVO */}
          {inboxSubTab === 'chat' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs grid grid-cols-1 md:grid-cols-12 min-h-[550px] overflow-hidden">
              
              {/* CHAT SIDEBAR (CONTACTOS / CONVERSAS) */}
              <div className="md:col-span-4 border-r border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-3.5 space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" /> Conversas Ativas
                </h3>

                <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                  {contactsList.length === 0 ? (
                    <p className="text-xs text-zinc-400 py-6 text-center">Nenhuma conversa encontrada.</p>
                  ) : (
                    contactsList.map(contact => {
                      const msgs = contactsMap.get(contact) || []
                      const lastMsg = msgs[msgs.length - 1]
                      const hasUnread = msgs.some(m => !m.lida)
                      const isSelected = selectedContact === contact

                      return (
                        <button
                          key={contact}
                          onClick={() => {
                            setSelectedContact(contact)
                            msgs.forEach(m => {
                              if (!m.lida) handleMarkAsRead(m.id)
                            })
                          }}
                          className={`w-full text-left p-2.5 border transition-all flex items-start gap-2.5 cursor-pointer ${
                            isSelected 
                              ? 'bg-zinc-900 dark:bg-zinc-800 text-white border-zinc-900 dark:border-zinc-700 shadow-2xs' 
                              : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 text-zinc-900 dark:text-white'
                          }`}
                        >
                          <div className={`w-8 h-8 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                            isSelected ? 'bg-zinc-800 dark:bg-zinc-700 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700'
                          }`}>
                            {contact.substring(0, 2).toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={`font-semibold text-xs truncate ${isSelected ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>{contact}</span>
                              {hasUnread && (
                                <span className="w-2 h-2 rounded-full bg-rose-600" />
                              )}
                            </div>
                            <p className={`text-[11px] truncate ${isSelected ? 'text-zinc-300' : 'text-zinc-500 dark:text-zinc-400'}`}>{lastMsg?.conteudo || 'Sem mensagens'}</p>
                            <span className="text-[10px] font-mono mt-0.5 block text-zinc-400">
                              {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              {/* CHAT MAIN ROOM */}
              <div className="md:col-span-8 flex flex-col justify-between bg-white dark:bg-zinc-900">
                {selectedContact ? (
                  <>
                    {/* CHAT ROOM HEADER */}
                    <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs">
                          {selectedContact.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 dark:text-white text-xs">{selectedContact}</h4>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" /> Em linha / Canal Direto
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 border border-zinc-200 dark:border-zinc-700 font-medium">
                        {activeChatMessages.length} mensagens
                      </span>
                    </div>

                    {/* CHAT MESSAGES STREAM */}
                    <div className="p-5 space-y-3.5 overflow-y-auto max-h-[380px] min-h-[350px]">
                      {activeChatMessages.map(msg => {
                        const isAdmin = msg.remetenteTipo === 'ADMIN'

                        return (
                          <div 
                            key={msg.id} 
                            className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 mb-0.5 px-1">
                              <span>{msg.remetenteNome}</span>
                              <span>•</span>
                              <span>{new Date(msg.createdAt).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <div 
                              className={`max-w-md p-3 text-xs shadow-2xs ${
                                isAdmin 
                                  ? 'bg-zinc-900 dark:bg-zinc-800 text-white border border-zinc-800 dark:border-zinc-700' 
                                  : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700'
                              }`}
                            >
                              <p className={`font-semibold text-[11px] mb-1 border-b pb-1 ${isAdmin ? 'border-zinc-800 text-zinc-300' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'}`}>{msg.assunto}</p>
                              <p className="whitespace-pre-line text-xs">{msg.conteudo}</p>

                              {/* Anexo de Documento */}
                              {msg.documentoId && (
                                <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-xs p-2 ${
                                  isAdmin ? 'border-zinc-800 bg-zinc-800' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                                }`}>
                                  <span className={`flex items-center gap-1.5 text-xs truncate ${isAdmin ? 'text-zinc-200' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                    <Paperclip className="w-3.5 h-3.5 text-zinc-400" /> Documento Anexo (ID #{msg.documentoId})
                                  </span>
                                  <a 
                                    href={getFileUrl('/uploads/documentos')}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className={`p-1 transition-colors ${isAdmin ? 'hover:bg-zinc-700 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* QUICK REPLY BAR */}
                    <form onSubmit={handleSendChatReply} className="p-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <select 
                          value={chatReplyDocId}
                          onChange={e => setChatReplyDocId(e.target.value)}
                          className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 px-2.5 py-1 max-w-xs focus:outline-none cursor-pointer"
                        >
                          <option value="">Anexo de documento</option>
                          {documentos.map(doc => (
                            <option key={doc.id} value={doc.id}>Anexo: #{doc.id} - {doc.titulo}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={chatReplyText}
                          onChange={e => setChatReplyText(e.target.value)}
                          placeholder={`Responder a ${selectedContact}...`} 
                          className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                        />
                        <button 
                          type="submit" 
                          disabled={isSendingReply}
                          className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 px-4 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {isSendingReply ? 'A enviar...' : <><SendHorizontal className="w-3.5 h-3.5" /> Enviar</>}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-8">
                    <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-xs font-medium">Selecione uma conversa na barra lateral para iniciar o chat.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* VISTA 2: FORMULÁRIO DE NOVA MENSAGEM / TICKET */}
          {inboxSubTab === 'formulario' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs p-5 max-w-3xl mx-auto space-y-4">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-4.5 h-4.5 text-zinc-800 dark:text-zinc-200" /> Formulário de Nova Mensagem / Envio Oficial
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Preencha o formulário para registar uma comunicação formal no sistema.</p>
              </div>

              <form onSubmit={handleSendInboxMessage} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Destinatário (Nome)</label>
                    <input 
                      type="text" 
                      value={newMsgData.destinatario_nome}
                      onChange={e => setNewMsgData(prev => ({ ...prev, destinatario_nome: e.target.value }))}
                      placeholder="Ex: Manuel António / Cliente #402" 
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Tipo de Destinatário</label>
                    <select 
                      value={newMsgData.destinatario_tipo}
                      onChange={e => setNewMsgData(prev => ({ ...prev, destinatario_tipo: e.target.value }))}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white cursor-pointer"
                    >
                      <option value="CLIENTE">Cliente Externa / Mutuário</option>
                      <option value="ADMIN">Administrador / Funcionário Interno</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Assunto da Mensagem</label>
                  <input 
                    type="text" 
                    value={newMsgData.assunto}
                    onChange={e => setNewMsgData(prev => ({ ...prev, assunto: e.target.value }))}
                    placeholder="Assunto da notificação ou esclarecimento" 
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Anexar Documento do Arquivo (Opcional)</label>
                  <select 
                    value={newMsgData.documento_id}
                    onChange={e => setNewMsgData(prev => ({ ...prev, documento_id: e.target.value }))}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white cursor-pointer"
                  >
                    <option value="">Nenhum documento anexado</option>
                    {documentos.map(doc => (
                      <option key={doc.id} value={doc.id}>#{doc.id} - {doc.titulo} ({doc.categoria})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Conteúdo da Mensagem</label>
                  <textarea 
                    value={newMsgData.conteudo}
                    onChange={e => setNewMsgData(prev => ({ ...prev, conteudo: e.target.value }))}
                    rows={5}
                    placeholder="Escreva os detalhes da mensagem..." 
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                    required
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button type="button" onClick={() => setInboxSubTab('chat')} className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer">Cancelar</button>
                  <button type="submit" disabled={isSendingMsg} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 px-4 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer">
                    {isSendingMsg ? 'A Enviar...' : <><Send className="w-3.5 h-3.5" /> Enviar Mensagem Formal</>}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

      {/* MODALS TRAMITACAO, PARTILHA & HISTORICO */}
      {selectedDocForTramitacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ArrowRight className="w-4.5 h-4.5 text-zinc-800 dark:text-zinc-200" /> Tramitação & Despacho de Documento
              </h3>
              <button onClick={() => setSelectedDocForTramitacao(null)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300">
              A tramitar o documento: <strong className="text-zinc-900 dark:text-white">{selectedDocForTramitacao.titulo}</strong> (Atual: {selectedDocForTramitacao.departamento})
            </div>

            <form onSubmit={handleTramitarSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Departamento de Destino</label>
                <select 
                  value={tramitacaoData.destino}
                  onChange={e => setTramitacaoData(prev => ({ ...prev, destino: e.target.value }))}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white cursor-pointer"
                >
                  <option value="FINANCEIRO">Departamento Financeiro</option>
                  <option value="RISCO">Análise de Risco & Conformidade</option>
                  <option value="JURIDICO">Departamento Jurídico</option>
                  <option value="RH">Recursos Humanos</option>
                  <option value="DIRECAO">Direção Executiva</option>
                  <option value="GERAL">Arquivo Geral</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Novo Estado do Documento</label>
                <select 
                  value={tramitacaoData.status_novo}
                  onChange={e => setTramitacaoData(prev => ({ ...prev, status_novo: e.target.value }))}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white cursor-pointer"
                >
                  <option value="EM_ANALISE">Em Análise</option>
                  <option value="APROVADO">Aprovado / Parecer Favorável</option>
                  <option value="REJEITADO">Rejeitado / Com Pendências</option>
                  <option value="CONCLUIDO">Concluído & Arquivado</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Parecer / Despacho do Responsável</label>
                <textarea 
                  value={tramitacaoData.despacho}
                  onChange={e => setTramitacaoData(prev => ({ ...prev, despacho: e.target.value }))}
                  placeholder="Escreva as observações ou despacho oficial..." 
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white h-20"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                <button type="button" onClick={() => setSelectedDocForTramitacao(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer">Cancelar</button>
                <button type="submit" disabled={isTramitando} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer">
                  {isTramitando ? 'A Tramitar...' : 'Confirmar Tramitação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedDocForShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4.5 h-4.5 text-zinc-800 dark:text-zinc-200" /> Partilhar / Enviar Documento
              </h3>
              <button onClick={() => setSelectedDocForShare(null)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 border border-zinc-200/80 dark:border-zinc-700">
              <button 
                type="button" 
                onClick={() => setShareType('email')} 
                className={`flex-1 py-1.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${shareType === 'email' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xs' : 'text-zinc-600 dark:text-zinc-400'}`}
              >
                <Mail className="w-3.5 h-3.5" /> Enviar por E-mail
              </button>
              <button 
                type="button" 
                onClick={() => setShareType('mensagem')} 
                className={`flex-1 py-1.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${shareType === 'mensagem' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xs' : 'text-zinc-600 dark:text-zinc-400'}`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> Enviar Mensagem / SMS
              </button>
            </div>

            <form onSubmit={handleShareSubmit} className="space-y-3">
              {shareType === 'email' ? (
                <>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">E-mail do Destinatário</label>
                    <input 
                      type="email" 
                      value={shareData.email_destino}
                      onChange={e => setShareData(prev => ({ ...prev, email_destino: e.target.value }))}
                      placeholder="destinatario@empresa.com" 
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Assunto do E-mail</label>
                    <input 
                      type="text" 
                      value={shareData.assunto}
                      onChange={e => setShareData(prev => ({ ...prev, assunto: e.target.value }))}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                      required
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Nome do Destinatário</label>
                  <input 
                    type="text" 
                    value={shareData.destinatario_nome}
                    onChange={e => setShareData(prev => ({ ...prev, destinatario_nome: e.target.value }))}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Mensagem Adicional</label>
                <textarea 
                  value={shareData.mensagem}
                  onChange={e => setShareData(prev => ({ ...prev, mensagem: e.target.value }))}
                  rows={3}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                <button type="button" onClick={() => setSelectedDocForShare(null)} className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer">Cancelar</button>
                <button type="submit" disabled={isSendingShare} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer">
                  {isSendingShare ? 'A Enviar...' : 'Enviar Agora'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedDocHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 max-w-2xl w-full space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-zinc-800 dark:text-zinc-200" /> Histórico & Linha Temporal de Despachos
              </h3>
              <button onClick={() => setSelectedDocHistory(null)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 flex justify-between">
              <span>Documento: <strong className="text-zinc-900 dark:text-white">{selectedDocHistory.titulo}</strong></span>
              <span>Estado Atual: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{selectedDocHistory.status}</strong></span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {(!selectedDocHistory.tramitacoes || selectedDocHistory.tramitacoes.length === 0) ? (
                <p className="text-center py-6 text-zinc-400 text-xs">Nenhum histórico de tramitação registado.</p>
              ) : (
                selectedDocHistory.tramitacoes.map((t: any, i: number) => (
                  <div key={t.id} className="relative pl-5 pb-3 border-l-2 border-zinc-200 dark:border-zinc-700 last:border-l-0">
                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-zinc-800 dark:bg-white border-2 border-white dark:border-zinc-900" />
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mb-0.5">
                      <span>Ponto #{i+1} - {t.origem} → <strong className="text-zinc-800 dark:text-zinc-200">{t.destino}</strong></span>
                      <span>{new Date(t.createdAt).toLocaleString('pt-AO')}</span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white mb-0.5">Despacho: "{t.despacho}"</p>
                    <div className="text-[10px] text-zinc-400">
                      Utilizador: {t.usuario} | Alterou estado de [{t.statusAnterior}] para [{t.statusNovo}]
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 flex justify-end border-t border-zinc-100 dark:border-zinc-800">
              <button onClick={() => setSelectedDocHistory(null)} className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-4 py-1.5 text-xs font-medium cursor-pointer">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileUp className="w-4.5 h-4.5 text-zinc-800 dark:text-zinc-200" /> Submeter Documento para o Arquivo
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Ficheiro do Documento</label>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Título do Documento</label>
                <input 
                  type="text" 
                  value={uploadData.titulo}
                  onChange={e => setUploadData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ex: Contrato assinado cliente João" 
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Categoria</label>
                  <select 
                    value={uploadData.categoria}
                    onChange={e => setUploadData(prev => ({ ...prev, categoria: e.target.value }))}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white cursor-pointer"
                  >
                    <option value="KYC">KYC & Identificação</option>
                    <option value="CONTRATO">Contrato / Acordo</option>
                    <option value="FATURA">Fatura / Recibo</option>
                    <option value="RELATORIO">Relatório</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Departamento Inicial</label>
                  <select 
                    value={uploadData.departamento}
                    onChange={e => setUploadData(prev => ({ ...prev, departamento: e.target.value }))}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white cursor-pointer"
                  >
                    <option value="GERAL">Geral / Recepção</option>
                    <option value="FINANCEIRO">Financeiro</option>
                    <option value="RISCO">Análise de Risco</option>
                    <option value="JURIDICO">Jurídico</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer">Cancelar</button>
                <button type="submit" disabled={isUploading} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer">
                  {isUploading ? 'A Carregar...' : 'Submeter Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}