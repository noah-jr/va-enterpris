import { useState } from 'react'
import { X, Download, Maximize2, Minimize2, ExternalLink, FileText } from 'lucide-react'

interface PdfViewerModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  pdfUrl: string
}

export function PdfViewerModal({ isOpen, onClose, title, pdfUrl }: PdfViewerModalProps) {
  const [isFullScreen, setIsFullScreen] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs transition-all font-sans antialiased">
      <div className={`flex flex-col bg-white border border-zinc-200/80 rounded-2xl shadow-xl overflow-hidden transition-all duration-200 ${
        isFullScreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[88vh]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200/60">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">{title}</h3>
              <p className="text-[11px] text-zinc-400 font-mono">Visualização Oficial de Documento PDF · Gloxis ERP</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all shadow-xs"
              title="Descarregar Ficheiro PDF"
            >
              <Download className="w-3.5 h-3.5" /> Descarregar
            </a>

            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer"
              title="Abrir em Nova Aba"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer"
              title={isFullScreen ? "Restaurar Tamanho" : "Ecrã Inteiro"}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer ml-2"
              title="Fechar Visualizador"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body (iFrame embed) */}
        <div className="flex-1 w-full bg-zinc-50 relative overflow-hidden">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-none bg-zinc-50"
            title={title}
          />
        </div>
      </div>
    </div>
  )
}
