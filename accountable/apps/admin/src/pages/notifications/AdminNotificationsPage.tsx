import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services/notification.service.js';
import { Card, CardContent, Spinner } from '@accountable/ui';
import { Bell } from 'lucide-react';

export const AdminNotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: () => notificationService.list(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    },
  });

  const notifications = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">Notificações</h1>
        <p className="text-xs sm:text-sm text-muted mt-1">As suas notificações e alertas mais recentes</p>
      </div>

      {isLoading && (
        <div className="py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <Card className="bg-surface/60 border-border/80">
          <CardContent className="py-16 text-center text-subtle space-y-2">
            <Bell className="w-8 h-8 mx-auto text-muted" />
            <p className="text-xs">Sem notificações no momento.</p>
          </CardContent>
        </Card>
      )}

      {notifications.length > 0 && (
        <Card className="bg-surface/60 border-border/80 overflow-hidden">
          <CardContent className="p-0">
            <ul className="divide-y divide-border/60">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => !n.readAt && markReadMutation.mutate(n.id)}
                  className={`px-5 py-3.5 cursor-pointer hover:bg-surface-muted/30 transition-colors ${
                    n.readAt ? '' : 'bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm font-medium text-foreground">{n.title}</p>
                    {!n.readAt && (
                      <span className="w-2 h-2 rounded-full bg-surface-muted" />
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">{n.body}</p>
                  <p className="text-[10px] text-subtle mt-1">
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
