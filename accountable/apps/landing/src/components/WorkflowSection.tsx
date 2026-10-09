import React, { useState } from 'react';
import { UploadCloud, FileCheck2, Users2, Send, Archive, ArrowRight } from 'lucide-react';

export const WorkflowSection: React.FC = () => {
  const [selectedStep, setSelectedStep] = useState<number>(2);

  const steps = [
    {
      id: 'submissao',
      icon: UploadCloud,
      stepNumber: '01',
      title: 'Submissão Segura e Verificação Imediata',
      detail: 'Cada ficheiro é verificado assim que chega, para garantir que é genuíno e não foi alterado.',
    },
    {
      id: 'triagem',
      icon: Users2,
      stepNumber: '02',
      title: 'Triagem Inteligente e Atribuição à Equipa Certa',
      detail: 'Encaminhamento automático para o consultor certo, conforme as competências de cada um.',
    },
    {
      id: 'analise',
      icon: FileCheck2,
      stepNumber: '03',
      title: 'Análise Técnica & Notas Internas Confidenciais',
      detail: 'Canal de comunicação interno, estritamente confidencial entre consultores e administradores.',
    },
    {
      id: 'despacho',
      icon: Send,
      stepNumber: '04',
      title: 'Despacho Oficial e Notificação Automática',
      detail: 'O processo avança por etapas claras e a sua equipa e clientes são avisados a cada passo.',
    },
    {
      id: 'custodia',
      icon: Archive,
      stepNumber: '05',
      title: 'Guarda Permanente e Cópias de Segurança',
      detail: 'Histórico completo de tudo o que aconteceu e cópias de segurança automáticas, para que nada se perca.',
    },
  ];

  const activeStep = steps[selectedStep] ?? steps[0]!;
  const ActiveIcon = activeStep.icon;

  return (
    <section id="como-funciona" className="py-20 sm:py-28 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium uppercase tracking-wider">
              Fluxo Operacional
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">
              Como funciona o ciclo de tramitação
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
              Da submissão do primeiro ficheiro até à conclusão com despacho oficial, cada etapa
              segue padrões estritos de segurança e conformidade legal.
            </p>

            <div className="space-y-1.5 pt-2">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isSelected = selectedStep === idx;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setSelectedStep(idx)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-100/80 dark:bg-zinc-900/80'
                        : 'border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-md shrink-0 ${
                        isSelected
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-medium ${
                        isSelected
                          ? 'text-zinc-900 dark:text-white font-semibold'
                          : 'text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {step.stepNumber} — {step.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <a
                href="#contacto"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs transition-colors"
              >
                Começar Agora
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 lg:pt-14">
            <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/40 p-8 sm:p-10 shadow-sm">
              <div className="w-11 h-11 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center mb-6">
                <ActiveIcon className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Etapa {activeStep.stepNumber}
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
                {activeStep.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {activeStep.detail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
