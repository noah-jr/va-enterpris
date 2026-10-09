import * as React from 'react';
import { Table2, BarChart3 } from 'lucide-react';

/**
 * Gráficos SVG do painel. Regras (skill dataviz): marcas finas com topo arredondado
 * ancorado à base, grelha discreta, uma escala por gráfico, cores de série validadas
 * (tokens --series-*), texto sempre em tokens de texto, tooltip ao passar o rato e
 * vista de tabela como alternativa acessível.
 */

export interface ChartSeries {
  key: string;
  label: string;
  /** Classe de cor (ex.: 'fill-series-1'). */
  colorClass: string;
  swatchClass: string;
}

export interface ChartPoint {
  label: string;
  /** Rótulo longo para tooltip/tabela (ex.: "Março 2026"). */
  fullLabel?: string;
  values: Record<string, number>;
}

const HEIGHT = 220;
const PAD = { top: 12, right: 8, bottom: 26, left: 36 };

function niceMax(value: number): number {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => value / s <= 4) ?? magnitude * 10;
  return Math.ceil(value / step) * step;
}

/** Retângulo com cantos de 4px só no topo (a ponta dos dados); base reta no eixo. */
function barPath(x: number, y: number, w: number, h: number): string {
  if (h <= 0) return '';
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
}

const ChartFrame: React.FC<{
  title: string;
  description?: string;
  series: ChartSeries[];
  showTable: boolean;
  onToggleTable: () => void;
  testId?: string;
  children: React.ReactNode;
}> = ({ title, description, series, showTable, onToggleTable, testId, children }) => (
  <figure data-testid={testId} className="rounded-xl border border-border bg-surface p-5 shadow-card">
    <figcaption className="flex items-start justify-between gap-3 mb-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onToggleTable}
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground px-2 py-1 rounded-md hover:bg-surface-muted"
        aria-pressed={showTable}
      >
        {showTable ? <BarChart3 className="w-3.5 h-3.5" /> : <Table2 className="w-3.5 h-3.5" />}
        {showTable ? 'Ver gráfico' : 'Ver tabela'}
      </button>
    </figcaption>
    {series.length > 1 && (
      <ul className="flex flex-wrap gap-4 mb-2 text-xs text-muted" aria-label="Legenda">
        {series.map((s) => (
          <li key={s.key} className="inline-flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${s.swatchClass}`} aria-hidden="true" />
            {s.label}
          </li>
        ))}
      </ul>
    )}
    {children}
  </figure>
);

const DataTable: React.FC<{ data: ChartPoint[]; series: ChartSeries[]; categoryLabel: string }> = ({ data, series, categoryLabel }) => (
  <div className="overflow-x-auto max-h-[240px]">
    <table className="w-full text-xs">
      <thead>
        <tr className="text-left text-muted border-b border-border">
          <th className="py-1.5 pr-3 font-medium">{categoryLabel}</th>
          {series.map((s) => (
            <th key={s.key} className="py-1.5 pr-3 font-medium text-right">
              {s.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.label} className="border-b border-border/60">
            <td className="py-1.5 pr-3 text-foreground">{d.fullLabel ?? d.label}</td>
            {series.map((s) => (
              <td key={s.key} className="py-1.5 pr-3 text-right tabular-nums text-foreground">
                {d.values[s.key] ?? 0}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ============================================================
// Barras verticais (1 ou mais séries agrupadas)
// ============================================================

export const ColumnChart: React.FC<{
  title: string;
  description?: string;
  data: ChartPoint[];
  series: ChartSeries[];
  categoryLabel?: string;
  testId?: string;
}> = ({ title, description, data, series, categoryLabel = 'Mês', testId }) => {
  const [showTable, setShowTable] = React.useState(false);
  const [hover, setHover] = React.useState<number | null>(null);
  const [width, setWidth] = React.useState(560);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => entry && setWidth(Math.max(280, entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [showTable]);

  const max = niceMax(Math.max(0, ...data.flatMap((d) => series.map((s) => d.values[s.key] ?? 0))));
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const band = plotW / Math.max(1, data.length);
  const gap = 2; // espaço de superfície entre barras adjacentes
  const groupW = Math.min(band * 0.7, 18 * series.length + gap * (series.length - 1));
  const barW = (groupW - gap * (series.length - 1)) / series.length;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;
  const total = data.reduce((sum, d) => sum + series.reduce((s2, s) => s2 + (d.values[s.key] ?? 0), 0), 0);

  return (
    <ChartFrame
      title={title}
      description={description}
      series={series}
      showTable={showTable}
      onToggleTable={() => setShowTable((v) => !v)}
      testId={testId}
    >
      {showTable ? (
        <DataTable data={data} series={series} categoryLabel={categoryLabel} />
      ) : (
        <div ref={wrapRef} className="relative">
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={`${title}. Total no período: ${total}.`}
            onMouseLeave={() => setHover(null)}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
                <text x={PAD.left - 6} y={y(t)} dy="0.32em" textAnchor="end" className="fill-subtle text-[10px] tabular-nums">
                  {t}
                </text>
              </g>
            ))}
            {data.map((d, i) => {
              const x0 = PAD.left + i * band + (band - groupW) / 2;
              return (
                <g key={d.label}>
                  {hover === i && (
                    <rect x={PAD.left + i * band} y={PAD.top} width={band} height={plotH} className="fill-surface-muted" />
                  )}
                  {series.map((s, si) => {
                    const v = d.values[s.key] ?? 0;
                    const h = (v / max) * plotH;
                    return <path key={s.key} d={barPath(x0 + si * (barW + gap), y(v), barW, h)} className={s.colorClass} />;
                  })}
                  <text
                    x={PAD.left + i * band + band / 2}
                    y={HEIGHT - 8}
                    textAnchor="middle"
                    className="fill-muted text-[10px]"
                  >
                    {d.label}
                  </text>
                  {/* Alvo de hover maior do que a marca */}
                  <rect
                    x={PAD.left + i * band}
                    y={PAD.top}
                    width={band}
                    height={plotH}
                    fill="transparent"
                    onMouseEnter={() => setHover(i)}
                    data-testid="chart-hit"
                  />
                </g>
              );
            })}
          </svg>
          {hover !== null && data[hover] && (
            <div
              role="tooltip"
              className="pointer-events-none absolute z-10 rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs shadow-lg"
              style={{
                left: Math.min(width - 150, Math.max(0, PAD.left + hover * band + band / 2 - 70)),
                top: 0,
              }}
            >
              <p className="font-medium text-foreground mb-1">{data[hover]!.fullLabel ?? data[hover]!.label}</p>
              {series.map((s) => (
                <p key={s.key} className="flex items-center gap-2 text-muted">
                  <span className={`w-2 h-2 rounded-sm ${s.swatchClass}`} aria-hidden="true" />
                  {s.label}: <span className="text-foreground font-medium tabular-nums">{data[hover]!.values[s.key] ?? 0}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </ChartFrame>
  );
};

// ============================================================
// Barras horizontais ordenadas (categorias com nomes longos)
// ============================================================

export const RankedBarChart: React.FC<{
  title: string;
  description?: string;
  items: Array<{ label: string; value: number }>;
  valueLabel?: string;
  testId?: string;
}> = ({ title, description, items, valueLabel = 'Total', testId }) => {
  const [showTable, setShowTable] = React.useState(false);
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const max = Math.max(1, ...sorted.map((i) => i.value));
  const series: ChartSeries[] = [{ key: 'v', label: valueLabel, colorClass: 'fill-series-1', swatchClass: 'bg-series-1' }];

  return (
    <ChartFrame
      title={title}
      description={description}
      series={series}
      showTable={showTable}
      onToggleTable={() => setShowTable((v) => !v)}
      testId={testId}
    >
      {showTable ? (
        <DataTable
          data={sorted.map((i) => ({ label: i.label, values: { v: i.value } }))}
          series={series}
          categoryLabel="Categoria"
        />
      ) : sorted.length === 0 ? (
        <p className="text-xs text-muted py-8 text-center">Sem dados.</p>
      ) : (
        <ul className="space-y-2" role="list">
          {sorted.map((i) => (
            <li key={i.label} className="grid grid-cols-[8.5rem_1fr_2.5rem] items-center gap-3 text-xs" title={`${i.label}: ${i.value}`}>
              <span className="text-muted truncate">{i.label}</span>
              <span className="h-2.5 rounded-r bg-surface-muted overflow-hidden">
                <span className="block h-full rounded-r bg-series-1" style={{ width: `${(i.value / max) * 100}%` }} />
              </span>
              <span className="text-right tabular-nums font-medium text-foreground">{i.value}</span>
            </li>
          ))}
        </ul>
      )}
    </ChartFrame>
  );
};
