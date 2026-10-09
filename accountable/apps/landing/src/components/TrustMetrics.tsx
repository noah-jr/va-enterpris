import React from 'react';
import { ShieldCheck, HardDrive, History, DatabaseBackup } from 'lucide-react';

export const TrustMetrics: React.FC = () => {
  const metrics = [
    { value: '+150.000', label: 'Processos Tramitados' },
    { value: '99.98%', label: 'Disponibilidade (SLA)' },
    { value: '100%', label: 'Auditoria Imutável' },
    { value: '< 15 min', label: 'Expiração de URLs' },
  ];

  const capabilities = [
    { icon: ShieldCheck, label: 'Permissões por função' },
    { icon: HardDrive, label: 'Guarda segura de documentos' },
    { icon: History, label: 'Histórico completo' },
    { icon: DatabaseBackup, label: 'Cópias de segurança automáticas' },
  ];

  return (
    <section id="plataforma" className="py-20 sm:py-28 border-y border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-3 mb-14">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium uppercase tracking-wider">
            Plataforma
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">
            Uma base sólida para cada processo
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
            Todas as áreas da plataforma partilham a mesma base de segurança: permissões claras
            por função, documentos guardados com todo o cuidado e um registo que nunca se apaga.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric) => (
            <div key={metric.label} className="p-5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950">
              <div className="font-semibold text-2xl sm:text-3xl text-zinc-900 dark:text-white tracking-tight">
                {metric.value}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div key={cap.label} className="flex items-center gap-3 p-3.5 rounded-md border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950">
                <Icon className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{cap.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
