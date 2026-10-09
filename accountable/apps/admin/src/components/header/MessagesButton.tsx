import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { ticketService } from '../../services/ticket.service.js';

const POLL_MS = 60_000;

export const MessagesButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname.startsWith('/tickets');

  const { data } = useQuery({
    queryKey: ['admin', 'tickets', 'open-count'],
    queryFn: async () => {
      const [open, inProgress] = await Promise.all([
        ticketService.list({ status: 'OPEN', perPage: 1 }),
        ticketService.list({ status: 'IN_PROGRESS', perPage: 1 }),
      ]);
      return open.total + inProgress.total;
    },
    refetchInterval: POLL_MS,
  });

  const count = data ?? 0;
  const badge = count >= 100 ? '99+' : String(count);

  return (
    <button
      type="button"
      onClick={() => navigate('/tickets')}
      aria-label="Tickets de suporte abertos"
      data-testid="header-messages"
      className={`relative p-2 rounded-lg transition-colors ${
        active ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
      }`}
    >
      <MessageSquare className="w-4 h-4" />
      {count > 0 && (
        <span
          data-testid="messages-badge"
          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-surface-muted text-foreground text-[10px] font-bold flex items-center justify-center shadow-sm"
        >
          {badge}
        </span>
      )}
    </button>
  );
};
