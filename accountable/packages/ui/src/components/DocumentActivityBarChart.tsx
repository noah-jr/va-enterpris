import * as React from 'react';

export interface MonthlyActivityItem {
  month: string;
  enviados: number;
  emProcesso: number;
  pendentes: number;
  concluidos: number;
}

interface DocumentActivityBarChartProps {
  data: MonthlyActivityItem[];
  title?: string;
  description?: string;
  className?: string;
}

export const DocumentActivityBarChart: React.FC<DocumentActivityBarChartProps> = ({
  data,
  title = 'Fluxo de Atividade Documental',
  description = 'Comparativo de submissões, análises e conclusões',
  className = '',
}) => {
  const [activeMonth, setActiveMonth] = React.useState<number | null>(null);

  const maxValue = Math.max(
    ...data.map((d) => d.enviados + d.emProcesso + d.pendentes + d.concluidos),
    10,
  );

  return (
    <div className={`p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-xs space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {title}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium">
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
            <span className="w-2.5 h-2.5 rounded bg-blue-500" />
            <span>Enviados</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
            <span className="w-2.5 h-2.5 rounded bg-sky-600" />
            <span>Em Processo</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
            <span className="w-2.5 h-2.5 rounded bg-amber-500" />
            <span>Pendentes</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span>Concluídos</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative pt-4 pb-2">
        <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2">
          {data.map((item, idx) => {
            const totalInMonth = item.enviados + item.emProcesso + item.pendentes + item.concluidos;
            const heightPercent = maxValue > 0 ? (totalInMonth / maxValue) * 100 : 0;
            const isHovered = activeMonth === idx;

            const hEnviados = totalInMonth > 0 ? (item.enviados / totalInMonth) * 100 : 0;
            const hEmProcesso = totalInMonth > 0 ? (item.emProcesso / totalInMonth) * 100 : 0;
            const hPendentes = totalInMonth > 0 ? (item.pendentes / totalInMonth) * 100 : 0;
            const hConcluidos = totalInMonth > 0 ? (item.concluidos / totalInMonth) * 100 : 0;

            return (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                onMouseEnter={() => setActiveMonth(idx)}
                onMouseLeave={() => setActiveMonth(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-14 z-20 px-3 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-[10px] font-mono shadow-md whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95">
                    <p className="font-semibold text-center mb-0.5">{item.month}</p>
                    <div className="flex gap-2">
                      <span>Env: {item.enviados}</span>
                      <span>Proc: {item.emProcesso}</span>
                      <span>Pend: {item.pendentes}</span>
                      <span>Conc: {item.concluidos}</span>
                    </div>
                  </div>
                )}

                {/* Stacked Bar Container */}
                <div
                  className={`w-full max-w-[42px] rounded-t-md overflow-hidden flex flex-col-reverse transition-all duration-300 ${
                    isHovered ? 'ring-2 ring-blue-500/50 scale-[1.03]' : ''
                  }`}
                  style={{ height: `${Math.max(heightPercent, 6)}%` }}
                >
                  {/* Concluídos (Emerald) */}
                  <div
                    style={{ height: `${hConcluidos}%` }}
                    className="bg-emerald-500 transition-all duration-300"
                    title={`Concluídos: ${item.concluidos}`}
                  />
                  {/* Pendentes (Amber) */}
                  <div
                    style={{ height: `${hPendentes}%` }}
                    className="bg-amber-500 transition-all duration-300"
                    title={`Pendentes: ${item.pendentes}`}
                  />
                  {/* Em Processo (Sky / Darkblue) */}
                  <div
                    style={{ height: `${hEmProcesso}%` }}
                    className="bg-sky-600 transition-all duration-300"
                    title={`Em Processo: ${item.emProcesso}`}
                  />
                  {/* Enviados (Blue) */}
                  <div
                    style={{ height: `${hEnviados}%` }}
                    className="bg-blue-500 transition-all duration-300"
                    title={`Enviados: ${item.enviados}`}
                  />
                </div>

                {/* Month label */}
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-2 truncate max-w-[48px] text-center">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
