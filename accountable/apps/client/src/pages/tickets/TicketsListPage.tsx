import * as React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ticketService } from '../../services/ticket.service.js';
import { Card, CardContent, Button, TicketStatusBadge, Spinner } from '@accountable/ui';
import { Plus, LifeBuoy } from 'lucide-react';

export const TicketsListPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketService.list(),
  });

  const tickets = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Tickets de Suporte
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Acompanhe os seus pedidos de esclarecimento e suporte
          </p>
        </div>
        <Link to="/tickets/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto justify-center gap-1.5">
            <Plus className="w-4 h-4" />
            Novo Ticket
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && tickets.length === 0 && (
        <Card className="bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
          <CardContent className="py-16 text-center text-subtle space-y-2 px-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-subtle flex items-center justify-center mx-auto mb-2">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Nenhum ticket encontrado</p>
            <p className="text-xs text-subtle">Ainda não abriu nenhum ticket de suporte.</p>
          </CardContent>
        </Card>
      )}

      {tickets.length > 0 && (
        <Card className="overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
          <CardContent className="p-0">
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="flex items-center justify-between p-3.5 sm:px-5 sm:py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:underline truncate">
                        {ticket.subject}
                      </p>
                      <p className="text-[11px] text-subtle mt-0.5">
                        {ticket.category} • {new Date(ticket.createdAt).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                    <TicketStatusBadge status={ticket.status} size="sm" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
