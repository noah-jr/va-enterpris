import React, { useState, useRef } from 'react'
import { api } from '../api/client'
import { useFileUrl } from '../hooks/useFileUrl'
import {
  Upload, Folder, FileText, File, Trash2, Download, Eye,
  Search, X, CheckCircle, Clock, AlertCircle, Plus,
  FileImage, FileSpreadsheet, FileBadge
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useDocumentos } from '../hooks/useDocumentos'
import type { Documento } from '../hooks/useDocumentos'
import type { User } from '../types'

// ─── Constants ──────────────────────────────────────────────────────────────
const CATEGORIAS: Array<{ value: string; label: string; icon: LucideIcon }> = [
  { value: 'TODOS',          label: 'Todos os Documentos', icon: Folder },
  { value: 'IDENTIFICACAO',  label: 'Identificação', icon: FileBadge },
  { value: 'COMPROVATIVO',   label: 'Comprovativos', icon: FileText },
  { value: 'CONTRATO',       label: 'Contratos', icon: FileText },
  { value: 'FINANCEIRO',     label: 'Financeiro', icon: FileSpreadsheet },
  { value: 'IMAGEM',         label: 'Imagens', icon: FileImage },
  { value: 'OUTRO',          label: 'Outros', icon: File },
]

const STATUS_MAP: Record<string, { label: string; badge: string; icon: LucideIcon }> = {
  PENDENTE:  { label: 'Pendente',  badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300', icon: Clock },
  APROVADO:  { label: 'Aprovado',  badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300', icon: CheckCircle },
  REJEITADO: { label: 'Rejeitado', badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',  icon: AlertCircle },
  ARQUIVO:   { label: 'Arquivado', badge: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',  icon: Folder },
}

const FILE_ICONS: Record<string, LucideIcon> = {
  pdf: FileText, png: FileImage, jpg: FileImage, jpeg: FileImage,
  xlsx: FileSpreadsheet, docx: FileText, csv: FileSpreadsheet,
}

function getFileIcon(caminho: string): LucideIcon {
  const ext = caminho?.split('.').pop()?.toLowerCase() || ''
  return FILE_ICONS[ext] || File
}

function getFileExt(caminho: string) {
  return caminho?.split('.').pop()?.toUpperCase() || 'FILE'
}

function formatBytes(b: number) {
  if (!b) return '—'
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}

// ─── Upload Modal ────────────────────────────────────────────────────────────
function UploadModal({ onClose, onSuccess, user }: { onClose: () => void; onSuccess: () => void; user: User | null }) {
  const [files, setFiles] = useState<File[]>([])
  const [categoria, setCategoria] = useState('COMPROVATIVO')
  const [titulo, setTitulo] = useState('')
  const [notas, setNotas] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const dropRef = useRef<HTMLDivElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...droppedFiles])
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selected])
  }

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx))

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (files.length === 0) { setError('Selecione pelo menos um ficheiro.'); return }
    setUploading(true)
    setProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fd = new FormData()
        fd.append('arquivo', file)
        fd.append('titulo', titulo || file.name.replace(/\.[^/.]+$/, ''))
        fd.append('categoria', categoria)
        fd.append('cliente_nome', user?.fullName || '')
        fd.append('cliente_email', user?.email || '')
        fd.append('notas', notas)
        fd.append('status', 'PENDENTE')
        fd.append('departamento', 'ARQUIVO_CLIENTE')

        await api.post('/documentos', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setProgress(Math.round(((i + 1) / files.length) * 100))
      }
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { error?: string } } }
      setError(errObj.response?.data?.error || 'Erro ao enviar ficheiro(s).')
    } finally {
      setUploading(false)
    }
  }

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)

  return (
    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg max-h-[92vh] overflow-y-auto p-6 space-y-5 shadow-xl">
        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider">Enviar Documentos</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">PDF, JPG, PNG, DOCX, XLSX • Máx. 50MB</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 font-semibold">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div
            ref={dropRef}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors cursor-pointer"
          >
            <Upload size={24} className="text-zinc-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-zinc-900 dark:text-white">Arraste ficheiros aqui</p>
            <p className="text-[11px] text-zinc-400 mt-1">ou</p>
            <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold uppercase tracking-wider cursor-pointer">
              <Plus size={13} /> Seleccionar Ficheiros
              <input type="file" multiple className="hidden" accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx,.csv,.txt" onChange={handleFileInput} />
            </label>
          </div>

          {files.length > 0 && (
            <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs">
              <div className="p-2.5 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">{files.length} ficheiro{files.length > 1 ? 's' : ''} · {formatBytes(totalSize)}</span>
                <button type="button" onClick={() => setFiles([])} className="text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider text-[10px] cursor-pointer">
                  Limpar tudo
                </button>
              </div>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-700 max-h-36 overflow-y-auto">
                {files.map((f, i) => {
                  const Icon = FILE_ICONS[f.name.split('.').pop()?.toLowerCase() || ''] || File
                  return (
                    <div key={i} className="flex items-center gap-2 p-2">
                      <Icon size={15} className="text-zinc-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-white truncate">{f.name}</p>
                        <p className="text-[10px] text-zinc-400">{formatBytes(f.size)}</p>
                      </div>
                      <button type="button" onClick={() => removeFile(i)} className="text-zinc-400 hover:text-rose-600 cursor-pointer">
                        <X size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Categoria</label>
            <select className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2 text-xs text-zinc-900 dark:text-white font-medium" value={categoria} onChange={e => setCategoria(e.target.value)}>
              {CATEGORIAS.filter(c => c.value !== 'TODOS').map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Título / Descrição <span className="text-zinc-400 font-normal">(opcional)</span></label>
            <input
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2 text-xs text-zinc-900 dark:text-white"
              placeholder="Ex: BI actualizado, Comprovativo de residência..."
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Notas <span className="text-zinc-400 font-normal">(opcional)</span></label>
            <textarea
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2 text-xs text-zinc-900 dark:text-white"
              rows={2}
              placeholder="Observações..."
              value={notas}
              onChange={e => setNotas(e.target.value)}
            />
          </div>

          {uploading && (
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-zinc-700 dark:text-zinc-300">A enviar...</span>
                <span className="text-zinc-900 dark:text-white">{progress}%</span>
              </div>
              <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 w-full overflow-hidden">
                <div className="h-full bg-zinc-900 dark:bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer" onClick={onClose} disabled={uploading}>Cancelar</button>
            <button type="submit" className="flex-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50" disabled={uploading || files.length === 0}>
              {uploading ? (
                <span>A enviar...</span>
              ) : (
                <><Upload size={14} /> Enviar {files.length > 0 ? `(${files.length})` : ''}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export function Documentos() {
  const {
    user,
    loading,
    categoriaFiltro,
    setCategoriaFiltro,
    search,
    setSearch,
    showUpload,
    setShowUpload,
    deleting,
    error,
    carregar,
    handleDelete,
    filtered,
    countFor,
  } = useDocumentos()
  const { getFileUrl } = useFileUrl()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Arquivo de Documentos</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Gerencie os seus documentos pessoais e anexos de financiamento.
          </p>
        </div>
        <button className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs px-4 py-2 uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer" onClick={() => setShowUpload(true)}>
          <Upload size={15} /> Enviar Documento
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 font-semibold">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Info Banner */}
      <div className="p-3 bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5">
        <CheckCircle size={16} className="text-zinc-900 dark:text-white shrink-0 mt-0.5" />
        <div>
          <strong>Dica:</strong> Carregue previamente o seu BI, comprovativo de residência e extracto bancário para aprovações mais rápidas.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Sidebar categories */}
        <div className="md:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 space-y-1 sticky top-20">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1">
            Categorias
          </p>
          {CATEGORIAS.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategoriaFiltro(cat.value)}
              className={`w-full flex items-center justify-between p-2 text-xs font-semibold cursor-pointer transition-colors ${
                categoriaFiltro === cat.value
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <cat.icon size={14} />
                <span>{cat.label}</span>
              </div>
              {countFor(cat.value) > 0 && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 ${
                  categoriaFiltro === cat.value
                    ? 'bg-zinc-700 dark:bg-zinc-200 text-white dark:text-zinc-900'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}>
                  {countFor(cat.value)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main area */}
        <div className="md:col-span-9 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white"
                placeholder="Pesquisar documentos..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {search && (
              <button className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center p-16">
              <div className="spinner spinner-lg" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
                <Folder size={24} />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{search ? 'Nenhum resultado' : 'Sem documentos'}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {search ? `Não foram encontrados documentos para "${search}".` : 'Comece por carregar os seus documentos.'}
              </p>
              {!search && (
                <button className="inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs px-4 py-2 uppercase tracking-wider mt-3" onClick={() => setShowUpload(true)}>
                  <Upload size={14} /> Enviar Documento
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="text-[11px] text-zinc-400 font-mono font-semibold">
                {filtered.length} documento{filtered.length !== 1 ? 's' : ''}
              </div>

              {/* Document grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((doc: Documento) => {
                  const FileIcon = getFileIcon(doc.caminho)
                  const ext = getFileExt(doc.caminho)
                  const st = STATUS_MAP[doc.status] || { label: doc.status, badge: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300', icon: Clock }
                  const isImage = ['PNG', 'JPG', 'JPEG'].includes(ext)

                  return (
                    <div key={doc.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xs group flex flex-col justify-between">
                      <div>
                        {/* Preview area */}
                        <div className="h-24 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center relative">
                          {isImage && doc.caminho ? (
                            <img
                              src={getFileUrl(doc.caminho)}
                              alt={doc.titulo}
                              className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white">
                              <FileIcon size={20} />
                            </div>
                          )}
                          <span className="absolute top-2 right-2 text-[9px] font-extrabold font-mono text-white bg-zinc-900 dark:bg-black px-1.5 py-0.5 uppercase">
                            {ext}
                          </span>
                        </div>

                        {/* Card body */}
                        <div className="p-3 space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-xs font-bold text-zinc-900 dark:text-white truncate flex-1">
                              {doc.titulo}
                            </p>
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 ${st.badge}`}>{st.label}</span>
                          </div>

                          <p className="text-[10px] text-zinc-400 font-medium">
                            {CATEGORIAS.find(c => c.value === doc.categoria)?.label || doc.categoria} · {new Date(doc.created_at).toLocaleDateString('pt-PT')}
                          </p>

                          {doc.notas && (
                            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 p-2 border border-zinc-200 dark:border-zinc-700 line-clamp-2">
                              {doc.notas}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-3 pt-0 flex gap-1.5">
                        <a
                          href={getFileUrl(doc.caminho)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 py-1.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                        >
                          <Eye size={12} /> Ver
                        </a>
                        <a
                          href={getFileUrl(doc.caminho)}
                          download
                          className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 py-1.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                        >
                          <Download size={12} /> Baixar
                        </a>
                        <button
                          className="bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-200 px-2 py-1.5 text-xs font-bold cursor-pointer"
                          onClick={() => handleDelete(doc.id)}
                          disabled={deleting === doc.id}
                        >
                          {deleting === doc.id
                            ? <div className="spinner w-3 h-3" />
                            : <Trash2 size={12} />
                          }
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {showUpload && (
        <UploadModal
          user={user}
          onClose={() => setShowUpload(false)}
          onSuccess={() => { carregar() }}
        />
      )}
    </div>
  )
}
