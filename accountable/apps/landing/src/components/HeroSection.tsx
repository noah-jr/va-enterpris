import React from 'react';
import { ArrowRight, ShieldCheck, History } from 'lucide-react';

interface HeroSectionProps {
  clientUrl?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  clientUrl = 'http://localhost:5173/auth/login',
}) => {
  const stats = [
    { value: '99.98%', label: 'Disponibilidade (SLA)' },
    { value: '100%', label: 'Auditoria Imutável' },
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Plataforma de Tramitação B2B</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.2rem] font-semibold tracking-tight text-zinc-900 dark:text-white leading-[1.12]">
              Os documentos dos
              <br />
              seus clientes, sempre em segurança.
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed">
              Receba, organize e acompanhe cada processo num só lugar — com auditoria em tempo real e controlo de acesso rigoroso.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
              <a
                href="#contacto"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs transition-colors"
              >
                <span>Solicitar Demonstração</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href={clientUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-medium text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                Entrar no Portal do Cliente
              </a>
            </div>

            <div className="flex items-center gap-10 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-semibold text-2xl sm:text-3xl text-zinc-900 dark:text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[360px] sm:h-[420px] lg:h-[440px] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 p-6 flex flex-col justify-between overflow-hidden shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-100/50 to-transparent dark:from-zinc-800/20 dark:to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              </div>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">vaonegest.secure.vault</span>
            </div>

            <div className="relative z-10 space-y-3 my-auto">
              <div className="flex items-center gap-3 p-3.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-sm">
                <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-zinc-900 dark:text-white">Documento Verificado</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Assinatura digital & hash SHA-256 válidos</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-sm">
                <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-zinc-900 dark:text-white">Registo de Auditoria</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Submissão → Em Análise → Despacho</div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Sessão Encriptada TLS 1.3</span>
              <span className="text-emerald-500 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
