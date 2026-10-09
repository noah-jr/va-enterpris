import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService } from '../../../services/message.service.js';
import { useAdminAuthStore } from '../../../stores/admin-auth.store.js';
import { Button, Input, Spinner } from '@accountable/ui';
import { Send } from 'lucide-react';

export const AdminMessageThread: React.FC<{ documentId: string }> = ({ documentId }) => {
  const queryClient = useQueryClient();
  const hasInternalPermission = useAdminAuthStore((s) => s.hasPermission('messages:send_internal'));
  const [content, setContent] = React.useState('');
  const [isInternal, setIsInternal] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'document-messages', documentId],
    queryFn: () => messageService.list(documentId),
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: () => messageService.send(documentId, { content, isInternal }),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'document-messages', documentId] });
    },
  });

  const messages = data?.data ?? [];

  return (
    <div className="pt-3 border-t border-border/80 space-y-2">
      <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Mensagens</p>
      {isLoading && <Spinner size="sm" />}
      <div className="space-y-2 max-h-56 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2.5 rounded-lg text-xs border ${
              msg.isInternal
                ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                : 'bg-zinc-950 border-zinc-800/70 text-zinc-200'
            }`}
          >
            {msg.isInternal && (
              <span className="block text-[10px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
                Nota interna
              </span>
            )}
            <p className="whitespace-pre-wrap">{msg.content}</p>
            <p className="text-[10px] text-subtle mt-1">
              {new Date(msg.createdAt).toLocaleString('pt-PT')}
            </p>
          </div>
        ))}
      </div>
      <form
        className="space-y-2 pt-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (content.trim()) sendMutation.mutate();
        }}
      >
        <Input
          placeholder="Escreva uma mensagem..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="text-xs"
        />
        <div className="flex items-center justify-between">
          {hasInternalPermission && (
            <label className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded border-border bg-surface text-foreground"
              />
              Nota interna
            </label>
          )}
          <Button
            type="submit"
            size="sm"
            className="ml-auto text-xs"
            isLoading={sendMutation.isPending}
            disabled={!content.trim()}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
