import { useState } from 'react'
import { Link } from 'react-router'
import { PhoneCall, ShieldCheck, Globe } from 'lucide-react'

export function TopHeader() {
  const [activeSegment, setActiveSegment] = useState('particulares')
  const [lang, setLang] = useState('PT')

  const segments = [
    { id: 'particulares', label: 'Particulares' },
    { id: 'empresas', label: 'Empresas' },
  ]

  return (
    <div data-testid="top-header" className="bg-zinc-950 text-zinc-400 text-[11px] py-1.5 px-6 border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        
        {/* Left: Brand Badge & Segment Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium text-zinc-300">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-200">Gloxis Financial Services</span>
            <span className="text-zinc-600 font-normal hidden sm:inline">• Registo BNA N.º 0048-26</span>
          </div>

          <div className="hidden md:flex items-center bg-zinc-900 rounded p-0.5 border border-zinc-800" role="navigation" aria-label="Segmentos">
            {segments.map((seg) => {
              const isActive = activeSegment === seg.id
              return (
                <button
                  key={seg.id}
                  onClick={() => setActiveSegment(seg.id)}
                  data-testid={`segment-${seg.id}`}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {seg.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Support Contact & Quick Links */}
        <div className="flex items-center gap-4 text-zinc-400">
          <Link
            to="/transparencia"
            data-testid="link-top-agencias"
            className="hover:text-zinc-200 transition-colors hidden lg:inline-block"
          >
            Balcão Único
          </Link>

          <Link
            to="/transparencia"
            data-testid="link-top-transparencia"
            className="hover:text-zinc-200 transition-colors hidden lg:inline-block"
          >
            Transparência
          </Link>

          <a
            href="tel:+244222692000"
            data-testid="link-linha24"
            className="hover:text-zinc-200 transition-colors flex items-center gap-1.5 font-medium"
          >
            <PhoneCall className="w-3 h-3 text-zinc-400" />
            <span className="hidden sm:inline">Apoio:</span>
            <span>+244 222 692 000</span>
          </a>

          <div className="flex items-center gap-1 border-l border-zinc-800 pl-3">
            <Globe className="w-3 h-3 text-zinc-500" />
            <button
              onClick={() => setLang(lang === 'PT' ? 'EN' : 'PT')}
              data-testid="btn-lang-toggle"
              className="hover:text-white font-semibold text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
            >
              {lang}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

