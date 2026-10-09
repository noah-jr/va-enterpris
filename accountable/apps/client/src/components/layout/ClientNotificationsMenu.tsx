import * as React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, ExternalLink, Inbox } from 'lucide-react';
import { notificationService, type NotificationItem } from '../../services/notification.service.js';

export const ClientNotificationsMenu: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications', 'client-menu'],
    queryFn: () => notificationService.list(1, 5),
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none"
        aria-label="Ver notificações"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Notificações</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                  {unreadCount} novas
                </span>
              )}
            </div>
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
            >
              Ver todas
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-subtle space-y-1.5">
                <Inbox className="w-5 h-5 mx-auto text-subtle" />
                <p className="text-xs">Sem notificações no momento</p>
              </div>
            ) : (
              notifications.map((item: NotificationItem) => {
                const isUnread = !item.readAt;
                return (
                  <div
                    key={item.id}
                    className={`p-3 transition-colors ${
                      isUnread
                        ? 'bg-zinc-50/80 dark:bg-zinc-800/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                          <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.title}</p>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{item.body}</p>
                        <p className="text-[10px] text-subtle">
                          {new Date(item.createdAt).toLocaleDateString('pt-PT', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {isUnread && (
                        <button
                          type="button"
                          onClick={() => markReadMutation.mutate(item.id)}
                          className="p-1 rounded text-subtle hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700 transition-colors shrink-0"
                          title="Marcar como lida"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-1.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 rounded-b-xl text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block w-full py-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Abrir central de notificações
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
