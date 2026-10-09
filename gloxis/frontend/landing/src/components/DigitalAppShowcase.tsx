import { Smartphone, Shield, Zap, QrCode, CheckCircle, Download } from 'lucide-react'
import { CLIENT_PORTAL_URL } from '../config/env'

export function DigitalAppShowcase() {
  return (
    <section id="vantagens" className="py-16 px-6 bg-zinc-900 text-white relative overflow-hidden" data-testid="digital-app-showcase">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center relative z-10">
        
        {/* Left Column Text */}
        <div className="lg:col-span-6 space-y-5">
          <div className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
            <Smartphone className="w-4 h-4 text-zinc-300" />
            <span>Balcão Digital do Cidadão & App Gloxis</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Serviço público desmaterializado de financiamento
          </h2>

          <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
            Consulte o estado de processos estatais, submeta certidões digitais e simule apoios financeiros em tempo real através do Portal Único do Cidadão.
          </p>

          {/* App Advantages */}
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-zinc-800/60 border border-zinc-700/80 p-3.5 rounded space-y-1">
              <div className="flex items-center gap-2 text-zinc-200 font-bold text-xs">
                <Zap className="w-4 h-4" />
                <span>Integração Kwik & EMIS</span>
              </div>
              <p className="text-zinc-400 text-[11px]">Pagamentos de emolumentos e transferências imediatas.</p>
            </div>

            <div className="bg-zinc-800/60 border border-zinc-700/80 p-3.5 rounded space-y-1">
              <div className="flex items-center gap-2 text-zinc-200 font-bold text-xs">
                <QrCode className="w-4 h-4 text-zinc-300" />
                <span>Chancela Digital QR</span>
              </div>
              <p className="text-zinc-400 text-[11px]">Autenticidade de certidões e comprovativos estatais.</p>
            </div>

            <div className="bg-zinc-800/60 border border-zinc-700/80 p-3.5 rounded space-y-1">
              <div className="flex items-center gap-2 text-zinc-200 font-bold text-xs">
                <Shield className="w-4 h-4 text-zinc-300" />
                <span>Biometria & Chave Móvel</span>
              </div>
              <p className="text-zinc-400 text-[11px]">Acesso seguro por Bilhete de Identidade eletrónico.</p>
            </div>

            <div className="bg-zinc-800/60 border border-zinc-700/80 p-3.5 rounded space-y-1">
              <div className="flex items-center gap-2 text-zinc-200 font-bold text-xs">
                <CheckCircle className="w-4 h-4" />
                <span>Acompanhamento de Processos</span>
              </div>
              <p className="text-zinc-400 text-[11px]">Notificações por SMS sobre despachos de candidatura.</p>
            </div>
          </div>

          {/* Store Download Badges */}
          <div className="pt-3 flex flex-wrap items-center gap-4">
            <a
              href={CLIENT_PORTAL_URL}
              data-testid="app-download-web-btn"
              className="bg-white text-zinc-900 hover:bg-zinc-100 px-5 py-2.5 rounded font-extrabold text-xs shadow-xs flex items-center gap-3 transition-all uppercase tracking-wider"
            >
              <Download className="w-4 h-4 text-zinc-900" />
              <div className="text-left">
                <p className="text-[9px] uppercase font-semibold text-zinc-500">Aceder ao Balcão</p>
                <p className="text-xs font-extrabold text-zinc-900">Portal do Cidadão Online</p>
              </div>
            </a>

            <div className="text-xs text-zinc-300 font-semibold border-l border-zinc-700 pl-4 py-1">
              <p>Disponível na Web, iOS e Android</p>
              <p className="text-[10px] text-zinc-400 font-normal">Plataforma Interoperável de Serviços Públicos</p>
            </div>
          </div>
        </div>

        {/* Right Column App Showcase Mockup */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-sm bg-zinc-950 p-4 rounded border border-zinc-800 shadow-2xl relative">
            
            {/* Screen Content */}
            <div className="bg-white rounded p-4 text-zinc-800 space-y-3.5">
              
              {/* Header inside mockup */}
              <div className="flex justify-between items-center pb-2.5 border-b border-zinc-200">
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Gloxis Financial</p>
                  <p className="text-xs font-extrabold text-zinc-900">Balcão do Cidadão</p>
                </div>
                <div className="w-7 h-7 rounded bg-zinc-100 border border-zinc-300 flex items-center justify-center text-zinc-900 text-xs font-extrabold">
                  GLX
                </div>
              </div>

              {/* Balance card inside mockup */}
              <div className="bg-zinc-900 text-white p-3.5 rounded space-y-1.5 border border-zinc-800">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Microcrédito Estatal Aprovado</p>
                <p className="text-base font-extrabold">Kz 1.450.000,00</p>
                <div className="flex justify-between text-[9px] text-zinc-400 pt-0.5 font-mono">
                  <span>N.º PROCESSO</span>
                  <span>GX-2026-GOV-9812</span>
                </div>
              </div>

              {/* Quick Action Icons inside mockup */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-zinc-700">
                <div className="p-2 bg-zinc-50 rounded border border-zinc-200">
                  <div className="w-6 h-6 bg-zinc-200 text-zinc-900 rounded mx-auto flex items-center justify-center mb-1">
                    <Zap className="w-3 h-3" />
                  </div>
                  <span>Kwik</span>
                </div>
                <div className="p-2 bg-zinc-50 rounded border border-zinc-200">
                  <div className="w-6 h-6 bg-zinc-200 text-zinc-900 rounded mx-auto flex items-center justify-center mb-1">
                    <QrCode className="w-3 h-3" />
                  </div>
                  <span>Chancela</span>
                </div>
                <div className="p-2 bg-zinc-50 rounded border border-zinc-200">
                  <div className="w-6 h-6 bg-zinc-200 text-zinc-900 rounded mx-auto flex items-center justify-center mb-1">
                    <Smartphone className="w-3 h-3" />
                  </div>
                  <span>Taxas</span>
                </div>
                <div className="p-2 bg-zinc-50 rounded border border-zinc-200">
                  <div className="w-6 h-6 bg-zinc-200 text-zinc-900 rounded mx-auto flex items-center justify-center mb-1">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                  <span>Despacho</span>
                </div>
              </div>

              {/* Active Process Status Card */}
              <div className="border border-zinc-200 p-2.5 rounded bg-zinc-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-zinc-900">Candidatura PME em Tramitação</p>
                  <p className="text-[9px] text-zinc-500">Parecer técnico emitido pelo MINFIN</p>
                </div>
                <span className="text-[10px] font-bold text-zinc-800 bg-zinc-200 px-2 py-0.5 rounded border border-zinc-300">
                  Deferido
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
