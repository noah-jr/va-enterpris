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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all">
      <div className={`flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
        isFullScreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[88vh]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">{title}</h3>
              <p className="text-xs text-slate-400">Visualização Interna de Documento PDF · Gloxis Admin</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-sm"
              title="Descarregar Ficheiro PDF"
            >
              <Download className="w-4 h-4" /> Descarregar
            </a>

            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-xl transition-colors"
              title="Abrir em Nova Aba Externa"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-xl transition-colors"
              title={isFullScreen ? "Restaurar Tamanho" : "Ecrã Inteiro"}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors ml-2"
              title="Fechar Visualizador"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body (iFrame embed) */}
        <div className="flex-1 w-full bg-slate-950 relative overflow-hidden">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-none bg-slate-950"
            title={title}
          />
        </div>
      </div>
    </div>
  )
}
