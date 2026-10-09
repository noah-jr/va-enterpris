import * as React from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useClickOutside } from '../../../lib/use-click-outside.js';
import { MONTHS, monthName } from './constants.js';

const MIN_YEAR = 2020;
const MAX_YEAR = 2030;

interface CompetencePeriodPickerProps {
  month: number;
  year: number;
  onChange: (period: { month: number; year: number }) => void;
}

export const CompetencePeriodPicker: React.FC<CompetencePeriodPickerProps> = ({ month, year, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setIsOpen(false), []);
  useClickOutside(ref, close, isOpen);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        data-testid="competence-picker"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      >
        <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        <span>
          {monthName(month)} / {year}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-subtle transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 z-40 w-[calc(100vw-3rem)] max-w-xs sm:w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 space-y-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Ano de Fecho</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onChange({ month, year: Math.max(MIN_YEAR, year - 1) })}
                className="p-1 rounded-md text-subtle hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Ano anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700">
                {year}
              </span>
              <button
                type="button"
                onClick={() => onChange({ month, year: Math.min(MAX_YEAR, year + 1) })}
                className="p-1 rounded-md text-subtle hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Ano seguinte"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <p className="text-[10px] font-semibold text-subtle uppercase tracking-wider mb-2 px-1">Selecionar Mês</p>
            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS.map((m) => {
                const isSelected = month === m.number;
                return (
                  <button
                    key={m.number}
                    type="button"
                    onClick={() => {
                      onChange({ month: m.number, year });
                      setIsOpen(false);
                    }}
                    className={`px-2.5 py-1.5 text-xs rounded-lg text-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium'
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
