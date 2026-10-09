import { Link } from 'react-router'
import { Home, Search, ShieldAlert } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-8 space-y-6 text-center shadow-xs" data-testid="not-found-page">
      <div className="w-14 h-14 bg-zinc-100 text-zinc-900 border border-zinc-200 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
        <ShieldAlert className="w-7 h-7 text-zinc-800" />
      </div>

      <div className="space-y-2">
        <span className="inline-block text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 px-2.5 py-1 rounded">
          Erro 404 • Página Não Encontrada
        </span>
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
          Endereço não localizado
        </h1>
        <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
          O endereço acedido não existe, foi alterado ou encontra-se temporariamente indisponível.
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
        <Link
          to="/"
          data-testid="link-404-home"
          className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg uppercase tracking-wider transition-all shadow-xs"
        >
          <Home className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </Link>
        <Link
          to="/solicitar"
          className="inline-flex items-center justify-center gap-2 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-zinc-900 font-semibold text-xs px-5 py-2.5 rounded-lg uppercase tracking-wider transition-all"
        >
          <Search className="w-4 h-4" />
          <span>Simulador & Candidatura</span>
        </Link>
      </div>
    </div>
  )
}
