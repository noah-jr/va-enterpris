import * as React from 'react';
import type { DocumentStatus } from '@accountable/types';
import { Card } from '@accountable/ui';
import { Search, Filter } from 'lucide-react';
import { ALL_STATUSES } from './document-status.constants.js';

export interface DocumentsFilterBarProps {
  search: string;
  status: DocumentStatus | undefined;
  onChange: (updater: (params: URLSearchParams) => void) => void;
}

export const DocumentsFilterBar: React.FC<DocumentsFilterBarProps> = ({
  search,
  status,
  onChange,
}) => {
  return (
    <Card className="p-3.5 bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-none transition-colors">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-subtle absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar por título ou tipo..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              onChange((p: URLSearchParams) => {
                if (value) p.set('search', value);
                else p.delete('search');
                p.set('page', '1');
              });
            }}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-subtle shrink-0" />
          <select
            value={status || ''}
            onChange={(e) => {
              const value = e.target.value;
              onChange((p: URLSearchParams) => {
                if (value) p.set('status', value);
                else p.delete('status');
                p.set('page', '1');
              });
            }}
            aria-label="Filtrar por estado documental"
            className="text-xs sm:text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
          >
            <option value="">Todos os Estados</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
};
