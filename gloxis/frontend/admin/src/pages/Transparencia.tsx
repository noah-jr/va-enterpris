import {
  PageShell, PageHeader, BtnPrimary, Modal, ModalFooter,
  FormField, inputClass, selectClass, Toast, BtnRefresh, BtnNew,
} from '../components/ui'
import {
  ShieldCheck, FileText, Upload, Trash2, Edit3, Save, Eye, EyeOff
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { api } from '../api/client'

interface Metrica {
  id?: number
  chave: string
  label: string
  val: string
  ordem?: number
}

interface Documento {
  id: number
  title: string
  date: string
  size?: string | null
  categoria: string
  fileUrl: string
  ordem: number
  ativo: boolean
}

export function Transparencia() {
  const [metricas, setMetricas] = useState<Metrica[]>([])
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingMetricas, setIsSavingMetricas] = useState(false)
  const [isUploadingDoc, setIsUploadingDoc] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const [editedMetricas, setEditedMetricas] = useState<Record<string, string>>({})
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Documento | null>(null)
  
  const [docTitle, setDocTitle] = useState('')
  const [docCategory, setDocCategory] = useState('Normativo')
  const [docDate, setDocDate] = useState(new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }))
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const fetchTransparenciaData = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/transparencia/admin')
      const data = response.data?.data || response.data
      if (data) {
        if (data.metricas) {
          setMetricas(data.metricas)
          const metMap: Record<string, string> = {}
          data.metricas.forEach((m: Metrica) => { metMap[m.chave] = m.val })
          setEditedMetricas(metMap)
        }
        if (data.documentos) setDocumentos(data.documentos)
      }
    } catch {
      showToast('Erro ao carregar dados da Transparência.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchTransparenciaData() }, [])

  const handleSaveMetricas = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingMetricas(true)
    try {
      const payload = metricas.map(m => ({
        ...m, val: editedMetricas[m.chave] !== undefined ? editedMetricas[m.chave] : m.val
      }))
      await api.put('/transparencia/metricas', { metricas: payload })
      showToast('Métricas de transparência atualizadas!')
      fetchTransparenciaData()
    } catch {
      showToast('Falha ao atualizar métricas.')
    } finally {
      setIsSavingMetricas(false)
    }
  }

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!docTitle) return
    setIsUploadingDoc(true)
    try {
      const formData = new FormData()
      formData.append('title', docTitle)
      formData.append('categoria', docCategory)
      formData.append('date', docDate)
      if (selectedFile) formData.append('file', selectedFile)

      if (editingDoc) {
        await api.put(`/transparencia/documentos/${editingDoc.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        showToast('Documento atualizado com sucesso!')
      } else {
        await api.post('/transparencia/documentos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        showToast('Novo documento publicado!')
      }

      setIsAddDocModalOpen(false)
      resetDocForm()
      fetchTransparenciaData()
    } catch {
      showToast('Erro ao guardar documento.')
    } finally {
      setIsUploadingDoc(false)
    }
  }

  const handleDeleteDocument = async (id: number) => {
    if (!confirm('Remover este documento da transparência pública?')) return
    try {
      await api.delete(`/transparencia/documentos/${id}`)
      showToast('Documento removido.')
      fetchTransparenciaData()
    } catch {
      showToast('Erro ao eliminar documento.')
    }
  }

  const handleToggleActiveDoc = async (doc: Documento) => {
    try {
      await api.put(`/transparencia/documentos/${doc.id}`, { ativo: !doc.ativo })
      showToast(`Documento ${!doc.ativo ? 'ativado' : 'desativado'}.`)
      fetchTransparenciaData()
    } catch {
      showToast('Erro ao alterar visibilidade.')
    }
  }

  const openEditModal = (doc: Documento) => {
    setEditingDoc(doc)
    setDocTitle(doc.title)
    setDocCategory(doc.categoria || 'Normativo')
    setDocDate(doc.date)
    setSelectedFile(null)
    setIsAddDocModalOpen(true)
  }

  const resetDocForm = () => {
    setEditingDoc(null)
    setDocTitle('')
    setDocCategory('Normativo')
    setDocDate(new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }))
    setSelectedFile(null)
  }

  return (
    <PageShell>
      {toast && <Toast message={toast} type="success" />}

      <PageHeader
        icon={ShieldCheck}
        title="Gestão da Transparência & Normativos BNA"
        description="Controlo de métricas financeiras públicas e publicação oficial de normativos em PDF."
      >
        <BtnRefresh onClick={fetchTransparenciaData} loading={isLoading} />
        <BtnNew onClick={() => { resetDocForm(); setIsAddDocModalOpen(true) }} label="Publicar Documento" />
      </PageHeader>

      {/* Metric Cards Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-tight">Métricas Financeiras Públicas</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Apresentadas na página oficial do Portal da Transparência.</p>
          </div>
          <BtnPrimary onClick={handleSaveMetricas} loading={isSavingMetricas} icon={Save}>
            {isSavingMetricas ? 'A guardar...' : 'Guardar Métricas'}
          </BtnPrimary>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {metricas.map((m) => (
            <div key={m.chave} className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-1.5">
              <label className="block text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{m.label}</label>
              <div className="relative">
                <input
                  type="text"
                  value={editedMetricas[m.chave] !== undefined ? editedMetricas[m.chave] : m.val}
                  onChange={(e) => setEditedMetricas({ ...editedMetricas, [m.chave]: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                />
                <Edit3 className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Normatives Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-tight">Documentos & Normativos Regulamentares</h3>
          <span className="text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-0.5 border border-zinc-200 dark:border-zinc-700">
            Total: {documentos.length} Documentos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] uppercase font-bold text-zinc-700 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Documento / Título</th>
                <th className="py-2.5 px-4 font-semibold">Categoria</th>
                <th className="py-2.5 px-4 font-semibold">Data Publicação</th>
                <th className="py-2.5 px-4 font-semibold">Tamanho</th>
                <th className="py-2.5 px-4 font-semibold">Estado</th>
                <th className="py-2.5 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
              {documentos.map((doc) => (
                <tr key={doc.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate max-w-md">{doc.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[10px] px-2 py-0.5 border border-zinc-200 dark:border-zinc-700 uppercase">
                      {doc.categoria || 'Normativo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-500 dark:text-zinc-400 text-xs">{doc.date}</td>
                  <td className="py-3 px-4 font-mono text-zinc-400 dark:text-zinc-500 text-xs">{doc.size || '1.0 MB'}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => handleToggleActiveDoc(doc)}
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 border cursor-pointer transition-colors ${
                        doc.ativo 
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                      }`}>
                      {doc.ativo ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{doc.ativo ? 'Público' : 'Oculto'}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEditModal(doc)} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteDocument(doc.id)} className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Publicar / Editar Documento */}
      {isAddDocModalOpen && (
        <Modal title={editingDoc ? 'Editar Documento Regulamentar' : 'Publicar Novo Documento (PDF)'} icon={ShieldCheck} onClose={() => setIsAddDocModalOpen(false)}>
          <form onSubmit={handleSaveDocument} className="space-y-3.5">
            <FormField label="Título do Documento" required>
              <input type="text" required value={docTitle} onChange={e => setDocTitle(e.target.value)}
                placeholder="Ex: Regulamento BNA 2026" className={inputClass} />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Categoria" required>
                <select value={docCategory} onChange={e => setDocCategory(e.target.value)} className={selectClass}>
                  <option value="Normativo">Normativo</option>
                  <option value="Regulamento">Regulamento</option>
                  <option value="Preçário">Preçário</option>
                  <option value="Relatório">Relatório</option>
                  <option value="Compliance">Compliance</option>
                </select>
              </FormField>
              <FormField label="Data Oficial">
                <input type="text" value={docDate} onChange={e => setDocDate(e.target.value)} className={inputClass} />
              </FormField>
            </div>

            <FormField label="Ficheiro PDF">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-dashed border-zinc-300 dark:border-zinc-700 text-center space-y-2">
                <Upload className="w-5 h-5 text-zinc-400 mx-auto" />
                <input type="file" accept=".pdf,.doc,.docx" onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="text-xs text-zinc-600 dark:text-zinc-300 block w-full file:mr-3 file:py-1 file:px-3 file:border-0 file:text-xs file:font-semibold file:bg-zinc-900 file:dark:bg-white file:text-white file:dark:text-zinc-900 cursor-pointer" />
                {selectedFile && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Selecionado: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                  </p>
                )}
              </div>
            </FormField>

            <ModalFooter onCancel={() => setIsAddDocModalOpen(false)}>
              <BtnPrimary type="submit" loading={isUploadingDoc}>
                {isUploadingDoc ? 'A guardar...' : 'Confirmar & Publicar'}
              </BtnPrimary>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </PageShell>
  )
}
