import * as React from 'react';
import {
  UploadCloud,
  Clock,
  AlertCircle,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export interface WorkflowStageCounts {
  submetidos: number;
  emAnalise: number;
  aguardandoDocumento: number;
  emProcessamento: number;
  concluidos: number;
}

interface DocumentWorkflowFlowChartProps {
  counts: WorkflowStageCounts;
  title?: string;
  className?: string;
}

export const DocumentWorkflowFlowChart: React.FC<DocumentWorkflowFlowChartProps> = ({
  counts,
  title = 'Fluxo de Tramitação de Processos',
  className = '',
}) => {
  const total =
    counts.submetidos +
    counts.emAnalise +
    counts.aguardandoDocumento +
    counts.emProcessamento +
    counts.concluidos;

  const stages = [
    {
      id: 'submetidos',
      label: 'Enviados',
      count: counts.submetidos,
      icon: UploadCloud,
      color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900',
    },
    {
      id: 'analise',
      label: 'Em Análise',
      count: counts.emAnalise,
      icon: Clock,
      color: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-900',
    },
    {
      id: 'aguardando',
      label: 'Pendentes',
      count: counts.aguardandoDocumento,
      icon: AlertCircle,
      color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900',
    },
    {
      id: 'processamento',
      label: 'Em Tratamento',
      count: counts.emProcessamento,
      icon: FileCheck2,
      color: 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900',
    },
    {
      id: 'concluidos',
      label: 'Tratados',
      count: counts.concluidos,
      icon: CheckCircle2,
      color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900',
    },
  ];

  return (
    <div className={`p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-xs space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {title}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Progresso pelas etapas operacionais
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
          Total: {total}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 pt-1">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const pct = total > 0 ? ((stage.count / total) * 100).toFixed(0) : '0';
          const isLast = idx === stages.length - 1;
          return (
            <div key={stage.id} className={`relative flex flex-col ${isLast ? 'col-span-2 sm:col-span-1' : ''}`}>
              <div
                className={`p-3.5 rounded-lg border flex flex-col justify-between h-full space-y-2 transition-all hover:scale-[1.02] ${stage.color}`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-mono font-semibold opacity-75">{pct}%</span>
                </div>
                <div>
                  <div className="text-xl font-bold tracking-tight">{stage.count}</div>
                  <div className="text-xs font-medium opacity-90 truncate mt-0.5">{stage.label}</div>
                </div>
              </div>

              {idx < stages.length - 1 && (
                <div className="hidden sm:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-zinc-300 dark:text-zinc-700">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
