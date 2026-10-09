import React from 'react';
import { ArrowRight, ShieldCheck, HardDrive, History, DatabaseBackup } from 'lucide-react';

interface StatementSectionProps {
  clientUrl?: string;
}

export const StatementSection: React.FC<StatementSectionProps> = ({
  clientUrl = 'http://localhost:5173/auth/login',
}) => {
  const capabilities = [
    { icon: ShieldCheck, label: 'Permissões por Função' },
    { icon: HardDrive, label: 'Guarda Segura' },
    { icon: History, label: 'Histórico Completo' },
    { icon: DatabaseBackup, label: 'Cópias de Segurança' },
  ];

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-zinc-900 text-white dark:bg-zinc-900/90 border-y border-zinc-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white leading-[1.2]">
          Uma base sólida para cada processo, do primeiro ficheiro ao despacho final.
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-8">
          <a
            href="#contacto"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-white hover:bg-zinc-100 text-zinc-950 font-medium text-xs transition-colors"
          >
            <span>Solicitar Demonstração</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a
            href={clientUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-zinc-700 bg-transparent text-zinc-300 hover:text-white font-medium text-xs hover:bg-zinc-800 transition-colors"
          >
            Entrar no Portal do Cliente
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-16 border-t border-zinc-800/80 mt-14">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div key={cap.label} className="flex flex-col items-center gap-2">
                <Icon className="w-4.5 h-4.5 text-zinc-400" />
                <span className="text-xs font-medium text-zinc-300">{cap.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
