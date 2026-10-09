import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '../../services/ticket.service.js';
import { useAdminAuthStore } from '../../stores/admin-auth.store.js';
import type { TicketStatus, TicketPriority } from '@accountable/types';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, TicketStatusBadge, Spinner } from '@accountable/ui';
import { Send, LifeBuoy } from 'lucide-react';

const ALL_STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'AWAITING_CLIENT', 'RESOLVED', 'CLOSED'];
const STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ['IN_PROGRESS', 'CLOSED'],
  IN_PROGRESS: ['AWAITING_CLIENT', 'RESOLVED', 'CLOSED'],
  AWAITING_CLIENT: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
};

export const AdminTicketsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const hasReadPermission = useAdminAuthStore((s) => s.hasPermission('tickets:read'));
  const hasReplyPermission = useAdminAuthStore((s) => s.hasPermission('tickets:reply'));
  const hasStatusPermission = useAdminAuthStore((s) => s.hasPermission('tickets:update_status'));

  const [statusFilter, setStatusFilter] = React.useState<TicketPriority | TicketStatus | ''>('');
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(null);
  const [reply, setReply] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'tickets', { status: statusFilter }],
    queryFn: () =>
      ticketService.list({ status: (statusFilter || undefined) as TicketStatus | undefined }),
    enabled: hasReadPermission,
  });

  const { data: ticketDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['admin', 'ticket', selectedTicketId],
    queryFn: () => ticketService.getById(selectedTicketId!),
    enabled: !!selectedTicketId,
    refetchInterval: 5000,
  });

  const replyMutation = useMutation({
    mutationFn: () => ticketService.reply(selectedTicketId!, { content: reply }),
    onSuccess: () => {
      setReply('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'ticket', selectedTicketId] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: TicketStatus) => ticketService.updateStatus(selectedTicketId!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ticket', selectedTicketId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
    },
  });

  if (!hasReadPermission) {
    return (
      <div className="text-center py-20 text-subtle text-xs">
        Não tem permissão para consultar tickets de suporte.
      </div>
    );
  }

  const tickets = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">Tickets de Suporte</h1>
        <p className="text-xs sm:text-sm text-muted mt-1">Consulte e responda aos tickets abertos pelos clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={selectedTicketId ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <Card className="bg-surface/60 border-border/80">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/80 pb-3">
              <CardTitle className="text-foreground text-sm">Tickets Registados</CardTitle>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TicketStatus | '')}
                className="h-8 px-2.5 text-xs rounded-lg bg-surface border border-border text-muted focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              >
                <option value="">Todos os estados</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading && (
                <div className="py-12 flex justify-center">
                  <Spinner size="md" />
                </div>
              )}

              {!isLoading && tickets.length === 0 && (
                <div className="py-12 text-center text-subtle space-y-2">
                  <LifeBuoy className="w-8 h-8 mx-auto text-muted" />
                  <p className="text-xs">Nenhum ticket encontrado.</p>
                </div>
              )}

              {!isLoading && tickets.length > 0 && (
                <ul className="divide-y divide-border/60">
                  {tickets.map((ticket) => (
                    <li
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`px-5 py-3.5 cursor-pointer hover:bg-surface-muted/30 transition-colors ${
                        selectedTicketId === ticket.id ? 'bg-zinc-800/50 ring-1 ring-inset ring-zinc-700' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs sm:text-sm font-medium text-foreground">{ticket.subject}</p>
                        <TicketStatusBadge status={ticket.status} />
                      </div>
                      <p className="text-[11px] text-subtle mt-0.5">
                        {ticket.category} • {new Date(ticket.createdAt).toLocaleDateString('pt-PT')}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {selectedTicketId && (
          <div>
            <Card className="bg-surface/80 border-border/80 sticky top-20">
              <CardHeader className="border-b border-border/80 pb-3">
                <CardTitle className="text-foreground text-sm">Detalhes do Ticket</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5">
                {detailsLoading && (
                  <div className="py-8 flex justify-center">
                    <Spinner size="md" />
                  </div>
                )}
                {ticketDetails && (
                  <>
                    <p className="text-sm font-semibold text-foreground">{ticketDetails.ticket.subject}</p>
                    <div className="p-3 rounded-lg bg-surface/80 border border-border/60">
                      <p className="text-xs text-muted whitespace-pre-wrap leading-relaxed">
                        {ticketDetails.ticket.description}
                      </p>
                    </div>

                    {hasStatusPermission && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/80">
                        {STATUS_TRANSITIONS[ticketDetails.ticket.status].map((next) => (
                          <Button
                            key={next}
                            size="sm"
                            variant="outline"
                            className="text-[11px]"
                            isLoading={statusMutation.isPending}
                            onClick={() => statusMutation.mutate(next)}
                          >
                            {next}
                          </Button>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2 max-h-56 overflow-y-auto pt-2 border-t border-border/80">
                      {ticketDetails.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className="p-2.5 rounded-lg bg-surface border border-border/70 text-xs text-foreground"
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-[10px] text-subtle mt-1">
                            {new Date(msg.createdAt).toLocaleString('pt-PT')}
                          </p>
                        </div>
                      ))}
                    </div>

                    {hasReplyPermission && ticketDetails.ticket.status !== 'CLOSED' && (
                      <form
                        className="flex items-center gap-2 pt-1"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (reply.trim()) replyMutation.mutate();
                        }}
                      >
                        <Input
                          placeholder="Responder..."
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          className="text-xs"
                        />
                        <Button type="submit" size="sm" isLoading={replyMutation.isPending} disabled={!reply.trim()}>
                          <Send className="w-3.5 h-3.5" />
                        </Button>
                      </form>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
