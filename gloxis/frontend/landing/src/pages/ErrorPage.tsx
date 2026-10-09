import { Link } from 'react-router'
import { RefreshCw, Home, AlertOctagon } from 'lucide-react'

interface ErrorPageProps {
  message?: string
  onRetry?: () => void
}

export function ErrorPage({ message, onRetry }: ErrorPageProps) {
  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-8 space-y-6 text-center shadow-xs" data-testid="error-page">
      <div className="w-14 h-14 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
        <AlertOctagon className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <span className="inline-block text-xs font-mono font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-2.5 py-1 rounded border border-rose-100">
          Erro de Sistema
        </span>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
          Ocorreu uma anomalia inesperada
        </h1>
        <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
          {message || 'Não foi possível processar o seu pedido neste momento. Por favor tente novamente ou contacte o suporte.'}
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
        {onRetry ? (
          <button
            onClick={onRetry}
            data-testid="btn-error-retry"
            className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg uppercase tracking-wider transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </button>
        ) : (
          <button
            onClick={() => window.location.reload()}
            data-testid="btn-error-reload"
            className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg uppercase tracking-wider transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recarregar Página</span>
          </button>
        )}

        <Link
          to="/"
          data-testid="link-error-home"
          className="inline-flex items-center justify-center gap-2 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-zinc-900 font-semibold text-xs px-5 py-2.5 rounded-lg uppercase tracking-wider transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Ir para Início</span>
        </Link>
      </div>
    </div>
  )
}
