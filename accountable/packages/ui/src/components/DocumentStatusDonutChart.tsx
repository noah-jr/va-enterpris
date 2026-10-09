import * as React from 'react';

export interface DocumentStatusChartData {
  enviados: number;
  emProcesso: number;
  pendentes: number;
  tratados: number;
  reencaminhados?: number;
}

interface DocumentStatusDonutChartProps {
  data: DocumentStatusChartData;
  title?: string;
  className?: string;
}

interface SliceInfo {
  label: string;
  count: number;
  percentage: number;
  color: string;
  strokeColor: string;
  dashArray: string;
  dashOffset: number;
}

export const DocumentStatusDonutChart: React.FC<DocumentStatusDonutChartProps> = ({
  data,
  title = 'Distribuição de Processos',
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const total =
    data.enviados +
    data.emProcesso +
    data.pendentes +
    data.tratados +
    (data.reencaminhados ?? 0);

  const radius = 64;
  const circumference = 2 * Math.PI * radius;

  const rawSlices = [
    {
      label: 'Enviados / Submetidos',
      count: data.enviados,
      color: 'bg-blue-500',
      strokeColor: '#3b82f6', // Light Blue / Blue
    },
    {
      label: 'Em Processo / Análise',
      count: data.emProcesso,
      color: 'bg-sky-600',
      strokeColor: '#0284c7', // Sky / Darkblue 600
    },
    {
      label: 'Pendentes (Aguardando)',
      count: data.pendentes,
      color: 'bg-amber-500',
      strokeColor: '#f59e0b', // Amber
    },
    {
      label: 'Tratados / Concluídos',
      count: data.tratados,
      color: 'bg-emerald-500',
      strokeColor: '#10b981', // Emerald
    },
    {
      label: 'Reencaminhados / Outros',
      count: data.reencaminhados ?? 0,
      color: 'bg-slate-400 dark:bg-slate-500',
      strokeColor: '#64748b', // Slate Gray
    },
  ];

  let accumulatedPercent = 0;
  const slices: SliceInfo[] = rawSlices.map((slice) => {
    const percentage = total > 0 ? (slice.count / total) * 100 : 0;
    const strokeLength = (percentage / 100) * circumference;
    const dashArray = `${strokeLength} ${circumference - strokeLength}`;
    const dashOffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += percentage;

    return {
      ...slice,
      percentage,
      dashArray,
      dashOffset,
    };
  });

  return (
    <div className={`p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-xs space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {title}
          </h3>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
            Total de {total} {total === 1 ? 'processo' : 'processos'}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-1">
        {/* Donut SVG */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            {/* Background empty track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="text-zinc-100 dark:text-zinc-800 stroke-current"
              strokeWidth="16"
              fill="transparent"
            />

            {/* Slices */}
            {total > 0 &&
              slices.map((slice, idx) => {
                if (slice.count === 0) return null;
                const isHovered = hoveredIndex === idx;
                return (
                  <circle
                    key={slice.label}
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={slice.strokeColor}
                    strokeWidth={isHovered ? 19 : 16}
                    strokeDasharray={slice.dashArray}
                    strokeDashoffset={slice.dashOffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            {hoveredIndex !== null && slices[hoveredIndex] ? (
              <>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {slices[hoveredIndex]!.count}
                </span>
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 max-w-[80px] truncate">
                  {slices[hoveredIndex]!.percentage.toFixed(0)}%
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {total}
                </span>
                <span className="text-[10px] font-medium text-subtle uppercase tracking-wider">
                  Processos
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend Breakdown List */}
        <div className="flex-1 w-full space-y-2">
          {slices.map((slice, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <div
                key={slice.label}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-center justify-between p-1.5 px-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  isHovered
                    ? 'bg-zinc-100 dark:bg-zinc-800'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${slice.color} shrink-0`} />
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate">
                    {slice.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {slice.count}
                  </span>
                  <span className="text-subtle w-9 text-right">
                    {slice.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
