import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ShieldCheck, HelpCircle, Phone, ArrowLeft } from 'lucide-react'

interface ErrorLayoutProps {
  children: ReactNode
}

export function ErrorLayout({ children }: ErrorLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between font-sans text-zinc-900" data-testid="error-layout">
      {/* Header for Standalone Error Pages */}
      <header className="bg-white border-b border-zinc-200/80 py-4 px-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5" data-testid="error-layout-brand">
            <img src="/logo-gloxis.png" alt="Gloxis Financials" className="h-8 w-auto object-contain" />
            <span className="font-extrabold text-base tracking-tight text-zinc-900">Gloxis</span>
          </Link>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-2 text-zinc-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <span>Ambiente Seguro Regulado BNA</span>
            </div>
            <Link
              to="/"
              data-testid="error-layout-home-link"
              className="inline-flex items-center gap-1.5 font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Página Inicial</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6" data-testid="error-layout-content">
        <div className="w-full max-w-lg">
          {children}
        </div>
      </main>

      {/* Minimal Footer for Error Pages */}
      <footer className="bg-white border-t border-zinc-200 py-4 px-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} Gloxis Financial Services S.A. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 font-medium">
            <a href="tel:+244222692000" className="hover:text-zinc-900 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-zinc-400" />
              <span>+244 222 692 000</span>
            </a>
            <Link to="/transparencia" className="hover:text-zinc-900 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              <span>Suporte ao Cidadão</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
