import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, FileText } from 'lucide-react'

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      badge: 'Programa Nacional de Inclusão Financeira',
      title: 'Plano Estatal de Microcrédito Direto ao Cidadão',
      subtitle: 'Programa de apoio ao financiamento desmaterializado até Kz 10.000.000,00 sob normativos de fomento da economia nacional.',
      features: ['Taxas bonificadas pelo Estado', 'Análise desmaterializada sem papéis', 'Prazos sustentáveis de 6 a 36 meses'],
      ctaPrimary: 'Submeter Candidatura',
      ctaPrimaryHref: '/solicitar',
      ctaSecondary: 'Consultar Normativos',
      ctaSecondaryHref: '/transparencia',
      bgGradient: 'from-[#0F172A] via-[#1E293B] to-[#334155]',
      decreeNo: 'Decreto Presidencial n.º 142/24'
    },
    {
      badge: 'Fomento ao Empreendedorismo & PMEs',
      title: 'Microcrédito Express PME & Startups',
      subtitle: 'Fundo de dinamização do setor produtivo privado, aquisição de equipamentos e reforço de tesouraria empresarial.',
      features: ['Condições especiais de carência', 'Garantias facilitadas pelo BNA', 'Atendimento no Balcão Único'],
      ctaPrimary: 'Financiar a Minha Empresa',
      ctaPrimaryHref: '/solicitar',
      ctaSecondary: 'Ver Transparência PME',
      ctaSecondaryHref: '/transparencia',
      bgGradient: 'from-[#1E293B] via-[#0F172A] to-[#1E3A8A]',
      decreeNo: 'Despacho Conjunto MINFIN/BNA'
    },
    {
      badge: 'Desenvolvimento Habitacional Social',
      title: 'Crédito Habitação & Obras de Beneficiação',
      subtitle: 'Facilidade de crédito bonificado para aquisição, construção e melhoria da habitação própria das famílias angolanas.',
      features: ['Taxa bonificada de juro', 'Supervisão direta e garantia institucional', 'Redução de emolumentos públicos'],
      ctaPrimary: 'Submeter Processo',
      ctaPrimaryHref: '/solicitar',
      ctaSecondary: 'Requisitos & Normativos',
      ctaSecondaryHref: '/transparencia',
      bgGradient: 'from-[#0F172A] via-[#1E3A8A] to-[#1E293B]',
      decreeNo: 'Plano Nacional de Habitação'
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [slides.length])

  const slide = slides[currentSlide]

  return (
    <section className="relative overflow-hidden bg-zinc-900 text-white border-b border-zinc-800" data-testid="hero-slider">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-zinc-950/90 transition-all duration-700 ease-in-out" />

      <div className="max-w-7xl mx-auto px-6 py-14 sm:py-20 relative z-10 grid lg:grid-cols-12 gap-10 items-center min-h-[480px]">
        
        {/* Left Column Content */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider text-zinc-300">
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>{slide.badge} — {slide.decreeNo}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white" data-testid="hero-title">
            {slide.title}
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal max-w-xl">
            {slide.subtitle}
          </p>

          {/* Features check list */}
          <div className="grid sm:grid-cols-3 gap-2.5 pt-1 text-xs font-semibold text-zinc-300">
            {slide.features.map((feat) => (
              <div key={feat} className="flex items-center gap-2 bg-zinc-800/80 border border-zinc-700/80 px-3 py-2 rounded">
                <CheckCircle2 className="w-4 h-4 text-zinc-200 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-3 pt-3">
            <Link
              to={slide.ctaPrimaryHref}
              data-testid="hero-cta-primary"
              className="bg-white text-zinc-900 hover:bg-zinc-100 px-6 py-3 rounded font-bold text-xs shadow-xs transition-all flex items-center gap-2 uppercase tracking-wider"
            >
              <span>{slide.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4 text-zinc-900" />
            </Link>

            <Link
              to={slide.ctaSecondaryHref}
              data-testid="hero-cta-secondary"
              className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:bg-zinc-800 px-5 py-3 rounded font-bold text-xs transition-all"
            >
              {slide.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Right Column Formal Card */}
        <div className="lg:col-span-5 relative hidden lg:block">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded p-6 shadow-xl text-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-zinc-200" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Gloxis Fintech S.A.</p>
                  <p className="text-xs font-bold text-white">Registo Oficial & Certificação BNA</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded uppercase tracking-wider">
                Selo Oficial
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-zinc-800/60 p-3 rounded border border-zinc-700/60">
                <span className="text-zinc-400">Teto Máximo de Apoio</span>
                <span className="font-bold text-white text-xs">Kz 10.000.000,00</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-800/60 p-3 rounded border border-zinc-700/60">
                <span className="text-zinc-400">Tempo Médio de Resposta</span>
                <span className="font-bold text-zinc-200 text-xs">24h a 48h úteis</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-800/60 p-3 rounded border border-zinc-700/60">
                <span className="text-zinc-400">Balcão de Atendimento</span>
                <span className="font-bold text-white text-xs">Portal do Cidadão Online</span>
              </div>
            </div>

            <Link
              to="/solicitar"
              data-testid="hero-card-simular-btn"
              className="w-full block text-center bg-white hover:bg-zinc-100 text-zinc-900 font-bold py-3 rounded text-xs shadow-xs uppercase tracking-wider transition-colors"
            >
              Submeter Processo Online
            </Link>
          </div>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="max-w-7xl mx-auto px-6 pb-4 relative z-10 flex justify-between items-center">
        {/* Indicators */}
        <div className="flex items-center space-x-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              data-testid={`slide-indicator-${idx}`}
              className={`h-1.5 rounded transition-all cursor-pointer ${
                currentSlide === idx ? 'w-6 bg-white' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            data-testid="prev-slide-btn"
            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            data-testid="next-slide-btn"
            className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
