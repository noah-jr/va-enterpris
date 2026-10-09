import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Spinner } from '@accountable/ui';
import {
  Link2,
  Copy,
  Check,
  Ban,
  XCircle,
  Share2,
  Calendar,
  Building2,
  MessageSquare,
  FileCheck2,
  AlertCircle,
} from 'lucide-react';
import type { ClientListItemDTO, ClientUploadSessionDTO } from '@accountable/types';
import { adminApiService } from '../../../services/admin-api.service.js';

export interface ClientUploadSessionModalProps {
  client: ClientListItemDTO | null;
  onClose: () => void;
}

const MONTHS = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

export const ClientUploadSessionModal: React.FC<ClientUploadSessionModalProps> = ({
  client,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = React.useState<number>(CURRENT_MONTH);
  const [selectedYear, setSelectedYear] = React.useState<number>(CURRENT_YEAR);
  const [label, setLabel] = React.useState('');
  const [createdSession, setCreatedSession] = React.useState<ClientUploadSessionDTO | null>(null);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedMessage, setCopiedMessage] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const clientId = client?.id ?? '';

  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['admin', 'client-upload-sessions', clientId],
    queryFn: () => adminApiService.listClientUploadSessions(clientId),
    enabled: Boolean(clientId),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      adminApiService.createClientUploadSession(clientId, {
        month: selectedMonth,
        year: selectedYear,
        label: label.trim() || undefined,
      }),
    onSuccess: (res) => {
      setCreatedSession(res.data);
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'client-upload-sessions', clientId] });
    },
    onError: (err: unknown) => {
      setActionError(err instanceof Error ? err.message : 'Falha ao gerar link de envio.');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) =>
      adminApiService.revokeClientUploadSession(clientId, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'client-upload-sessions', clientId] });
      if (createdSession) {
        setCreatedSession(null);
      }
    },
    onError: (err: unknown) => {
      setActionError(err instanceof Error ? err.message : 'Falha ao revogar sessão.');
    },
  });

  if (!client) return null;

  const sessions = sessionsData?.data ?? [];

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(false);
    }
  };

  const handleCopyMessage = async (url: string, month?: number | null, year?: number | null) => {
    const monthLabel = month ? MONTHS.find((m) => m.value === month)?.label : '';
    const periodText = monthLabel ? `referentes a ${monthLabel} de ${year || CURRENT_YEAR}` : 'solicitados';
    const message = `Olá, prezado(a) ${client.name}.\n\nSolicitamos a submissão dos documentos ${periodText} para a ${client.company || 'sua empresa'}.\n\nPara enviar os ficheiros de forma rápida, segura e sem necessidade de login, utilize o nosso link oficial:\n${url}\n\nObrigado,\nEquipa VA OneGest`;

    try {
      await navigator.clipboard.writeText(message);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch {
      setCopiedMessage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl text-foreground max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Gerar Link de Envio de Documentos
              </h2>
              <p className="text-xs text-muted">
                Permite ao cliente carregar múltiplos documentos para um determinado mês/ano
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground p-1 rounded-lg hover:bg-surface-muted transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Client Info Summary */}
        <div className="bg-surface-muted/60 rounded-xl p-4 border border-border flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-muted block text-[11px] uppercase tracking-wider">Cliente</span>
            <span className="font-semibold text-foreground text-sm">{client.name}</span>
            <span className="text-muted block">{client.email}</span>
          </div>
          <div className="space-y-1">
            <span className="text-muted block text-[11px] uppercase tracking-wider">Empresa / NIP</span>
            <span className="font-medium text-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
              {client.company || '—'}
            </span>
            <span className="font-mono text-muted">NIP: {client.nip}</span>
          </div>
        </div>

        {actionError && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Form to Generate New Session Link */}
        <div className="space-y-4 bg-surface/40 rounded-xl p-4 border border-border">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            Configurar Período de Recepção
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Mês de Referência</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full text-xs rounded-lg bg-surface-muted border border-border px-3 py-2 text-foreground focus:bg-surface focus:outline-none"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label} ({m.value.toString().padStart(2, '0')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Ano de Referência</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full text-xs rounded-lg bg-surface-muted border border-border px-3 py-2 text-foreground focus:bg-surface focus:outline-none"
              >
                {YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Etiqueta / Descrição Opcional
            </label>
            <Input
              type="text"
              placeholder="Ex: Documentos Contabilísticos, Guias de Pagamento AGT, etc."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="text-xs bg-surface-muted border-border text-foreground placeholder:text-subtle"
            />
          </div>

          <Button
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            isLoading={createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            <Link2 className="w-4 h-4 mr-2" />
            Gerar Link de Envio Criptografado
          </Button>
        </div>

        {/* Latest Created Link Banner */}
        {createdSession && createdSession.url && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-4 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
              <FileCheck2 className="w-4 h-4" />
              <span>Link Seguro Gerado com Sucesso!</span>
            </div>

            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={createdSession.url}
                className="text-xs bg-surface border-emerald-200 dark:border-emerald-800/50 text-foreground"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleCopyLink(createdSession.url!)}
                className="shrink-0 bg-surface-muted text-foreground hover:bg-surface-muted"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  handleCopyMessage(createdSession.url!, createdSession.month, createdSession.year)
                }
                className="text-xs bg-surface-muted/80 border-border text-emerald-700 dark:text-emerald-400 hover:bg-surface-muted flex items-center gap-1.5"
              >
                {copiedMessage ? <Check className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                {copiedMessage ? 'Mensagem Copiada!' : 'Copiar Texto para WhatsApp / Email'}
              </Button>
            </div>
          </div>
        )}

        {/* Active & Past Sessions History */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
            Links Gerados para este Cliente ({sessions.length})
          </h3>

          {isLoadingSessions && (
            <div className="py-6 flex items-center justify-center gap-2 text-muted text-xs">
              <Spinner size="sm" />
              <span>A carregar links existentes...</span>
            </div>
          )}

          {!isLoadingSessions && sessions.length === 0 && (
            <p className="text-xs text-subtle italic py-2">
              Nenhum link de envio gerado anteriormente para este cliente.
            </p>
          )}

          {!isLoadingSessions && sessions.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {sessions.map((sess) => {
                const monthName = sess.month
                  ? MONTHS.find((m) => m.value === sess.month)?.label
                  : null;
                const period = monthName ? `${monthName} / ${sess.year}` : 'Geral';
                const isRevoked = Boolean(sess.revokedAt);
                const isExpired = !isRevoked && new Date(sess.expiresAt).getTime() <= Date.now();
                const isActive = !isRevoked && !isExpired;

                return (
                  <div
                    key={sess.id}
                    data-testid={`upload-session-${sess.id}`}
                    className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                      !isActive
                        ? 'bg-slate-900/40 border-slate-800 opacity-60'
                        : 'bg-slate-800/70 border-slate-700'
                    }`}
                  >
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{period}</span>
                        {sess.label && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-muted text-muted">
                            {sess.label}
                          </span>
                        )}
                        {isRevoked ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                            Revogado
                          </span>
                        ) : isExpired ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            Expirado
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            Ativo ({sess.documentsCount || 0} doc(s))
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted block truncate">
                        Criado em {new Date(sess.createdAt).toLocaleString('pt-PT')}
                        {isActive && ` · Válido até ${new Date(sess.expiresAt).toLocaleDateString('pt-PT')}`}
                      </span>
                      {isActive && !sess.url && (
                        <span className="text-[10px] text-subtle block">
                          Link antigo: não pode ser recopiado (gere um novo se necessário).
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isActive && sess.url && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => handleCopyLink(sess.url!)}
                            title="Copiar Link"
                            className="text-xs bg-surface-muted text-foreground hover:bg-border p-2"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => handleCopyMessage(sess.url!, sess.month, sess.year)}
                            title="Copiar Mensagem Formatada"
                            className="text-xs bg-surface-muted text-foreground hover:bg-border p-2"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      {isActive && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          isLoading={revokeMutation.isPending}
                          onClick={() => revokeMutation.mutate(sess.id)}
                          title="Revogar Link"
                          className="text-xs text-red-700 dark:text-red-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 p-2"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="bg-surface-muted text-muted hover:bg-surface-muted"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};
