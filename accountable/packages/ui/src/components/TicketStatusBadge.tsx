import * as React from 'react';
import type { TicketStatus } from '@accountable/types';
import { cn } from '../utils/cn.js';

export interface TicketStatusBadgeProps {
  status: TicketStatus;
  className?: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<TicketStatus, { label: string; dot: string }> = {
  OPEN: { label: 'Aberto', dot: 'bg-blue-500' },
  IN_PROGRESS: { label: 'Em Progresso', dot: 'bg-amber-500' },
  AWAITING_CLIENT: {
    label: 'Aguarda Cliente',
    dot: 'bg-orange-500',
  },
  RESOLVED: { label: 'Resolvido', dot: 'bg-emerald-500' },
  CLOSED: { label: 'Encerrado', dot: 'bg-zinc-400' },
};

export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({
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
