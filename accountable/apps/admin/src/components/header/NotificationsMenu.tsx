import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Spinner } from '@accountable/ui';
import { notificationService, type NotificationItem } from '../../services/notification.service.js';
import { relativeTime } from '../../lib/relative-time.js';
import { useClickOutside } from '../../lib/use-click-outside.js';
import type { PaginatedResponse } from '@accountable/types';

const NOTIFICATIONS_KEY = ['admin', 'notifications'] as const;
const POLL_MS = 60_000;

const resolveTarget = (metadata: Record<string, unknown> | null): string | null => {
  if (!metadata) return null;
  if (typeof metadata.ticketId === 'string') return '/tickets';
  if (typeof metadata.documentId === 'string') return '/documents';
  return null;
};

export const NotificationsMenu: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);

  const { data, isLoading, refetch } = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => notificationService.list(),
    refetchInterval: POLL_MS,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const previous = queryClient.getQueryData<PaginatedResponse<NotificationItem>>(NOTIFICATIONS_KEY);
      if (previous) {
        queryClient.setQueryData<PaginatedResponse<NotificationItem>>(NOTIFICATIONS_KEY, {
          ...previous,
          data: previous.data.map((n) =>
            n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n,
          ),
        });
      }
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(NOTIFICATIONS_KEY, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });

  const notifications = data?.data ?? [];
  const unread = notifications.filter((n) => n.readAt === null).length;
  const badge = unread >= 10 ? '9+' : String(unread);

  const toggle = (): void => {
    const next = !open;
    setOpen(next);
    if (next) void refetch();
  };

  const handleClick = (n: NotificationItem): void => {
    if (!n.readAt) markReadMutation.mutate(n.id);
    const target = resolveTarget(n.metadata);
    if (target) {
      setOpen(false);
      navigate(target);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notificações"
        data-testid="header-notifications"
        className={`relative p-2 rounded-lg transition-colors ${
          open ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
        }`}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span
            data-testid="notifications-badge"
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-surface-muted text-foreground text-[10px] font-bold flex items-center justify-center shadow-sm"
          >
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-11 sm:w-96 rounded-xl bg-surface border border-border z-40 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-xs font-semibold text-foreground">Notificações</span>
            {unread > 0 && <span className="text-[10px] text-muted font-mono">{unread} por ler</span>}
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading && (
              <div className="flex justify-center py-8">
                <Spinner size="sm" />
              </div>
            )}
            {!isLoading && notifications.length === 0 && (
              <p className="px-4 py-8 text-center text-xs text-subtle">Sem notificações por agora.</p>
            )}
            {notifications.length > 0 && (
              <ul className="divide-y divide-border/60">
                {notifications.slice(0, 8).map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleClick(n)}
                      data-testid="notification-row"
                      data-unread={n.readAt === null ? 'true' : 'false'}
                      className={`w-full text-left px-4 py-3 transition-colors hover:bg-surface-muted/40 ${
                        n.readAt ? '' : 'bg-zinc-800/20'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                            n.readAt ? 'bg-transparent' : 'bg-zinc-100'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs truncate ${
                              n.readAt ? 'text-zinc-300' : 'text-zinc-100 font-medium'
                            }`}
                          >
                            {n.title}
                          </p>
                          <p className="text-[11px] text-muted line-clamp-2 mt-0.5">{n.body}</p>
                          <p className="text-[10px] text-subtle mt-1">{relativeTime(n.createdAt)}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center px-4 py-2.5 text-xs font-medium text-muted hover:text-foreground border-t border-border bg-surface transition-colors"
          >
            Ver todas
          </Link>
        </div>
      )}
    </div>
  );
};
