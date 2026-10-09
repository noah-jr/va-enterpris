import { useState, useEffect } from 'react'
import { FileText, ShieldCheck, Download, BarChart3, Loader2 } from 'lucide-react'
import { httpService } from '../services/httpService'

interface Metrica {
  id?: number
  label: string
  val: string
}

interface Documento {
  id?: number
  title: string
  date: string
  size?: string | null
  categoria?: string
  fileUrl: string
}

const DEFAULT_METRICAS: Metrica[] = [
  { label: 'Volume de Microcrédito Concedido', val: '12.4 B Kz' },
  { label: 'Cidadãos & PMEs Beneficiados', val: '45.890+' },
  { label: 'Taxa Média de Aprovação', val: '94.2%' },
  { label: 'Registo Oficial BNA', val: 'N.º 0048-26' },
]

const DEFAULT_NORMATIVOS: Documento[] = [
  { title: 'Aviso N.º 10/2024 BNA - Regulamento de Microcrédito', date: 'Janeiro 2026', size: '1.4 MB', categoria: 'Regulamento', fileUrl: '/uploads/aviso_10_2024_bna.pdf' },
  { title: 'Preçário Oficial e Tabela de Taxas Máximas (Kz)', date: 'Fevereiro 2026', size: '890 KB', categoria: 'Preçário', fileUrl: '/uploads/precario_oficial_gloxis.pdf' },
  { title: 'Relatório Institucional de Transparência & Governação 2025', date: 'Dezembro 2025', size: '3.2 MB', categoria: 'Relatório', fileUrl: '/uploads/relatorio_transparencia_2025.pdf' },
  { title: 'Código de Conduta e Proteção ao Consumidor Financeiro', date: 'Outubro 2025', size: '1.1 MB', categoria: 'Normativo', fileUrl: '/uploads/codigo_conduta_consumidor.pdf' },
  { title: 'Guia de Prevenção do Branqueamento de Capitais (BCFT)', date: 'Novembro 2025', size: '2.0 MB', categoria: 'Compliance', fileUrl: '/uploads/guia_bcft_gloxis.pdf' },
]

export function TransparenciaPage() {
  const [metricas, setMetricas] = useState<Metrica[]>(DEFAULT_METRICAS)
  const [normativos, setNormativos] = useState<Documento[]>(DEFAULT_NORMATIVOS)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    async function loadTransparenciaData() {
      try {
        const response = await httpService.get<{ metricas: Metrica[]; documentos: Documento[] }>('/transparencia')
        if (isMounted && response.data) {
          if (response.data.metricas && response.data.metricas.length > 0) {
            setMetricas(response.data.metricas)
          }
          if (response.data.documentos && response.data.documentos.length > 0) {
            setNormativos(response.data.documentos)
          }
        }
      } catch {
        // Usa fallback padrão pré-carregado
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadTransparenciaData()
    return () => {
      isMounted = false
    }
  }, [])

  const handleDownload = (doc: Documento) => {
    if (doc.fileUrl && doc.fileUrl.startsWith('/uploads/')) {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api/v1'
      const rootBackend = backendUrl.replace('/api/v1', '')
      window.open(`${rootBackend}${doc.fileUrl}`, '_blank')
    } else {
      alert(`A descarregar ${doc.title} (PDF)...`)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-6" data-testid="transparencia-page">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 text-white rounded text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Conformidade & Regulação BNA
          </span>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
            Portal da Transparência Gloxis
          </h1>
          <p className="text-sm text-zinc-600 max-w-xl mx-auto">
            Disponibilização pública de normativos, preçários e relatórios financeiros nos termos da regulamentação bancária angolana.
          </p>
        </div>

        {/* Financial Metrics Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="stats-grid">
          {metricas.map((st, idx) => (
            <div key={st.id || st.label || idx} className="bg-white border border-zinc-200 rounded-lg p-5 text-center space-y-1 shadow-xs">
              <span className="text-2xl font-extrabold text-zinc-900 tracking-tight block">
                {st.val}
              </span>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                {st.label}
              </span>
            </div>
          ))}
        </div>

        {/* Normatives & Documents Download Section */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-zinc-800" />
              <h2 className="text-lg font-bold text-zinc-900">
                Documentos Regulamentares & Relatórios Públicos
              </h2>
            </div>
            {isLoading && (
              <span className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Atualizando...
              </span>
            )}
          </div>

          <div className="space-y-3" data-testid="normativos-list">
            {normativos.map((doc, idx) => (
              <div key={doc.id || doc.title || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50 border border-zinc-200/80 rounded-lg gap-4 hover:border-zinc-300 transition-all">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded border border-zinc-200 text-zinc-800 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-zinc-900">{doc.title}</h4>
                      {doc.categoria && (
                        <span className="text-[9px] bg-zinc-200 text-zinc-800 font-bold px-1.5 py-0.5 rounded uppercase">
                          {doc.categoria}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                      Publicado em {doc.date} • Tamanho: {doc.size || '1.0 MB'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="inline-flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-3.5 py-2 rounded uppercase tracking-wider transition-colors shrink-0 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descarregar PDF</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
