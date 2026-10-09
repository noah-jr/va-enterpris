import * as React from 'react';
import type { DocumentStatus } from '@accountable/types';
import { cn } from '../utils/cn.js';

export interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; dot: string }
> = {
  DRAFT: {
    label: 'Rascunho',
    dot: 'bg-slate-400',
  },
  SUBMITTED: {
    label: 'Submetido',
    dot: 'bg-blue-500',
  },
  IN_ANALYSIS: {
    label: 'Em Análise',
    dot: 'bg-amber-500',
  },
  AWAITING_DOCUMENT: {
    label: 'Aguarda Documento',
    dot: 'bg-orange-500',
  },
  IN_PROCESSING: {
    label: 'Em Processamento',
    dot: 'bg-purple-500',
  },
  REPLIED: {
    label: 'Respondido',
    dot: 'bg-teal-500',
  },
  COMPLETED: {
    label: 'Concluído',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Cancelado',
    dot: 'bg-rose-500',
  },
  REJECTED: {
    label: 'Rejeitado',
    dot: 'bg-red-500',
  },
  ARCHIVED: {
    label: 'Arquivado',
    dot: 'bg-zinc-400',
  },
};

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({
  status,
  className,
}) => {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    dot: 'bg-zinc-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/60 transition-colors',
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
      {config.label}
    </span>
  );
};
