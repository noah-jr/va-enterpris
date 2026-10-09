import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '../../services/ticket.service.js';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  TicketStatusBadge,
  Spinner,
} from '@accountable/ui';
import {
  ArrowLeft,
  Send,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const TicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [content, setContent] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketService.getById(id!),
    enabled: !!id,
    refetchInterval: 5000,
  });

  const replyMutation = useMutation({
    mutationFn: () => ticketService.reply(id!, { content }),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
  });

  if (isLoading || !data) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-subtle">
        <Spinner size="lg" />
        <p className="text-xs">A carregar detalhes do ticket...</p>
      </div>
    );
  }

  const { ticket, messages } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Voltar aos Tickets</span>
        </Link>

        <div className="flex items-center gap-2">
          <TicketStatusBadge status={ticket.status} />
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            {ticket.category}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Conversation Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Ticket Header & Description Card */}
          <Card className="bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs overflow-hidden">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 p-4 sm:p-5">
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug">
                    {ticket.subject}
                  </h1>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-subtle">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    Criado em {new Date(ticket.createdAt).toLocaleString('pt-PT')}
                  </span>
                  <span>•</span>
                  <span>ID: <strong className="font-mono text-zinc-600 dark:text-zinc-300">{ticket.id.slice(0, 8)}...</strong></span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-700 dark:text-zinc-300">
                    <User className="w-3 h-3" />
                  </div>
                  <span>Descrição Inicial da Solicitação</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {ticket.description}
                </p>
              </div>

              {/* Message Thread */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-subtle uppercase tracking-wider">
                  <span>Respostas e Mensagens ({messages.length})</span>
                </div>

                {messages.length === 0 && (
                  <div className="p-6 text-center text-subtle text-xs rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    A equipa de suporte irá analisar o seu pedido e responder por este canal em breve.
                  </div>
                )}

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {messages.map((msg) => {
                    const isClient = msg.senderType === 'CLIENT';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-subtle">
                          <span className="font-semibold text-zinc-600 dark:text-zinc-300">
                            {isClient ? 'Você' : 'Equipa Contabilística'}
                          </span>
                          <span>•</span>
                          <span className="font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString('pt-PT', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div
                          className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                            isClient
                              ? 'bg-blue-600 text-white rounded-br-xs'
                              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Reply Box */}
              {ticket.status !== 'CLOSED' ? (
                <form
                  className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (content.trim()) replyMutation.mutate();
                  }}
                >
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Adicionar Resposta ao Pedido
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escreva a sua mensagem de esclarecimento ou resposta..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 text-xs sm:text-sm rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors resize-y"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={replyMutation.isPending}
                      disabled={!content.trim()}
                      className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Mensagem</span>
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-xs text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Este ticket foi marcado como concluído e fechado.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Info Sidebar */}
        <div className="space-y-4">
          <Card className="bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <CardHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-subtle">
                Informação da Solicitação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-subtle">Estado:</span>
                <TicketStatusBadge status={ticket.status} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-subtle">Categoria:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{ticket.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-subtle">Canal:</span>
                <span className="text-zinc-700 dark:text-zinc-300">Portal do Cliente</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-subtle">Encriptação:</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium text-[11px]">
                  <Lock className="w-3 h-3" />
                  Ponta a Ponta
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Auditoria &amp; Custódia</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Todas as interações e documentos trocados neste ticket ficam arquivados com selo temporal no histórico da sua empresa.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

