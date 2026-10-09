import React from 'react';
import { ShieldCheck, HardDrive, History, DatabaseBackup } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Cada pessoa só vê o que precisa de ver',
      description:
        'Defina perfis para Administradores, Consultores e Suporte, e a plataforma garante que cada um acede apenas ao que lhe compete.',
    },
    {
      icon: HardDrive,
      title: 'Os seus documentos, sempre em segurança',
      description:
        'Cada ficheiro fica guardado num cofre digital dedicado, nunca exposto publicamente. Só quem tem autorização consegue abrir um documento, e mesmo esse acesso expira automaticamente ao fim de 15 minutos.',
    },
    {
      icon: History,
      title: 'Um histórico completo de cada processo',
      description:
        'Saiba sempre quem fez o quê e quando: cada ação fica registada automaticamente e não pode ser apagada. Perfeito para responder a auditorias internas ou externas sem sobressaltos.',
    },
    {
      icon: DatabaseBackup,
      title: 'Nunca perde um documento',
      description:
        'Os seus dados e ficheiros são copiados e verificados automaticamente, com confirmação de que cada cópia está intacta. Mesmo que algo corra mal, o seu negócio continua a funcionar sem perder informação.',
    },
  ];

  return (
    <section id="funcionalidades" className="py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-3 mb-16">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium uppercase tracking-wider">
            Funcionalidades
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">
            Uma plataforma feita para durar
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
            Construída com os mais exigentes critérios de segurança para que os seus processos
            nunca fiquem parados nem vulneráveis, hoje e à medida que o seu negócio cresce.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="p-6 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex flex-col justify-between">
                <div className="w-9 h-9 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex items-center justify-center mb-4">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
