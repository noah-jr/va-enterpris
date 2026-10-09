import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useClickOutside } from '../../../lib/use-click-outside.js';
import { PRIORITY_OPTIONS, type DocumentPriorityValue } from './constants.js';

interface PrioritySelectProps {
  value: DocumentPriorityValue;
  onChange: (value: DocumentPriorityValue) => void;
}

export const PrioritySelect: React.FC<PrioritySelectProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setIsOpen(false), []);
  useClickOutside(ref, close, isOpen);

  const current = PRIORITY_OPTIONS.find((p) => p.value === value) ?? PRIORITY_OPTIONS[1]!;

  return (
    <div className="flex items-center gap-2" ref={ref}>
      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Prioridade:</span>
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/60 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 transition-colors shadow-2xs focus:outline-none"
        >
          <span className={`w-2 h-2 rounded-full ${current.dotColor}`} />
          <span>{current.label}</span>
          <ChevronDown className="w-3 h-3 text-subtle" />
        </button>

        {isOpen && (
          <div
            role="listbox"
            className="absolute right-0 mt-1 z-30 w-36 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg p-1.5 space-y-0.5 animate-in fade-in duration-150"
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={value === opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors ${
                  value === opt.value
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                  <span>{opt.label}</span>
                </div>
                {value === opt.value && <Check className="w-3 h-3 text-blue-600" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
