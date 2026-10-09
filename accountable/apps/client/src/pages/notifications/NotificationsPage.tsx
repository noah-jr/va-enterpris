import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services/notification.service.js';
import { Card, CardContent, Spinner } from '@accountable/ui';
import { Bell } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.list(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Notificações
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          As suas notificações e alertas mais recentes
        </p>
      </div>

      {isLoading && (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <Card className="bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
          <CardContent className="py-16 text-center text-subtle space-y-2 px-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-subtle flex items-center justify-center mx-auto mb-2">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Sem notificações</p>
            <p className="text-xs text-subtle">Não existem novos alertas ou notificações por agora.</p>
          </CardContent>
        </Card>
      )}

      {notifications.length > 0 && (
        <Card className="overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
          <CardContent className="p-0">
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => !n.readAt && markReadMutation.mutate(n.id)}
                  className={`p-3.5 sm:px-5 sm:py-3.5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                    n.readAt ? '' : 'bg-zinc-50/80 dark:bg-zinc-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100">{n.title}</p>
                    {!n.readAt && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{n.body}</p>
                  <p className="text-[10px] text-subtle mt-1 font-mono">
                    {new Date(n.createdAt).toLocaleString('pt-PT')}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
