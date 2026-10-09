import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { adminApiService } from '../../services/admin-api.service.js';
import type { AuditLogDTO, AuditAction } from '@accountable/types';
import {
  Card,
  CardContent,
  Button,
  Spinner,
} from '@accountable/ui';
import {
  History,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Code2,
} from 'lucide-react';

const COMMON_ACTIONS: AuditAction[] = [
  'LOGIN',
  'LOGOUT',
  'DOCUMENT_CREATED',
  'DOCUMENT_STATUS_CHANGED',
  'DOCUMENT_ASSIGNED',
  'FILE_UPLOADED',
  'FILE_DOWNLOADED',
  'CLIENT_CREATED',
  'CLIENT_BLOCKED',
  'CLIENT_UNBLOCKED',
  'USER_CREATED',
  'BACKUP_CREATED',
];

export const AdminAuditPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const action = (searchParams.get('action') as AuditAction) || undefined;
  const entity = searchParams.get('entity') || undefined;

  const [selectedLog, setSelectedLog] = React.useState<AuditLogDTO | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit', { page, action, entity }],
    queryFn: () =>
      adminApiService.listAuditLogs({
        page,
        perPage: 25,
        action,
        entity,
      }),
  });

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const getActionBadgeClass = (actionName: string) => {
    if (actionName.includes('BLOCKED') || actionName.includes('FAILED') || actionName.includes('DELETED')) {
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60';
    }
    if (actionName.includes('STATUS') || actionName.includes('ASSIGNED')) {
      return 'bg-surface-muted text-foreground border-border';
    }
    if (actionName.includes('CREATED') || actionName.includes('VERIFIED')) {
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60';
    }
    return 'bg-surface text-muted border-border';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">Trilha de Auditoria & Segurança</h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Registo imutável de todas as ações de utilizadores, clientes e operações do sistema
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-surface border border-border text-muted flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-muted" />
            Total: {total} Registos
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3.5 bg-surface/60 border-border/80">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-subtle shrink-0" />
            <select
              value={action || ''}
              onChange={(e) => {
                const p = new URLSearchParams(searchParams);
                if (e.target.value) p.set('action', e.target.value);
                else p.delete('action');
                p.set('page', '1');
                setSearchParams(p);
              }}
              aria-label="Filtrar por Ação"
              className="text-xs sm:text-sm rounded-lg bg-surface border border-border px-3 py-2 text-muted focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            >
              <option value="">Todas as Ações</option>
              {COMMON_ACTIONS.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={entity || ''}
              onChange={(e) => {
                const p = new URLSearchParams(searchParams);
                if (e.target.value) p.set('entity', e.target.value);
                else p.delete('entity');
                p.set('page', '1');
                setSearchParams(p);
              }}
              aria-label="Filtrar por Entidade"
              className="text-xs sm:text-sm rounded-lg bg-surface border border-border px-3 py-2 text-muted focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            >
              <option value="">Todas as Entidades</option>
              <option value="Document">Document (Processo)</option>
              <option value="Client">Client (Cliente)</option>
              <option value="User">User (Colaborador)</option>
              <option value="DocumentFile">DocumentFile (Anexo)</option>
              <option value="Backup">Backup</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Audit Logs Table */}
      <Card className="bg-surface/60 border-border/80 overflow-hidden">
        <CardContent className="p-0">
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-subtle">
              <Spinner size="lg" />
              <p className="text-xs">A carregar registos de auditoria...</p>
            </div>
          )}

          {!isLoading && logs.length === 0 && (
            <div className="py-16 text-center text-subtle space-y-2">
              <History className="w-8 h-8 mx-auto text-muted" />
              <p className="text-xs">Nenhum registo de auditoria encontrado para os critérios selecionados.</p>
            </div>
          )}

          {!isLoading && logs.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border/80 bg-surface/90 text-muted font-medium text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-5">Ação Realizada</th>
                    <th className="py-3 px-4">Entidade</th>
                    <th className="py-3 px-4">Ator (Autor)</th>
                    <th className="py-3 px-4">Endereço IP</th>
                    <th className="py-3 px-4">Data & Hora</th>
                    <th className="py-3 px-5 text-right">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-muted/30 transition-colors">
                      <td className="py-3 px-5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium border ${getActionBadgeClass(
                            log.action,
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted">
                        {log.entity ? (
                          <div>
                            <span className="font-medium text-foreground">{log.entity}</span>
                            {log.entityId && (
                              <span className="block text-[10px] text-subtle font-mono truncate max-w-xs">
                                {log.entityId}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-subtle">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted">
                        {log.userId ? (
                          <span className="text-muted font-mono text-[11px]">User: {log.userId.substring(0, 8)}...</span>
                        ) : log.clientId ? (
                          <span className="text-muted font-mono text-[11px]">Client: {log.clientId.substring(0, 8)}...</span>
                        ) : (
                          <span className="text-subtle">Sistema</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted font-mono text-[11px]">
                        {log.ipAddress || '—'}
                      </td>
                      <td className="py-3 px-4 text-muted">
                        {new Date(log.createdAt).toLocaleString('pt-PT')}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="text-xs gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Diff
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border/80 bg-surface/40 text-xs text-muted">
              <div>
                Página <span className="font-medium text-foreground">{page}</span> de{' '}
                <span className="font-medium text-foreground">{totalPages}</span> ({total} registos)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.set('page', (page - 1).toString());
                    setSearchParams(p);
                  }}
                  className="text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.set('page', (page + 1).toString());
                    setSearchParams(p);
                  }}
                  className="text-xs"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Diff & Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-foreground font-medium text-sm">
                <Code2 className="w-4 h-4 text-muted" />
                <span>Registo de Auditoria #{selectedLog.id.substring(0, 8)}</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-muted hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-surface border border-border">
                <span className="text-subtle block text-[10px] uppercase font-medium">Ação</span>
                <span className="font-semibold text-foreground">{selectedLog.action}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface border border-border">
                <span className="text-subtle block text-[10px] uppercase font-medium">Entidade</span>
                <span className="font-semibold text-foreground">{selectedLog.entity || 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface border border-border">
                <span className="text-subtle block text-[10px] uppercase font-medium">Endereço IP</span>
                <span className="font-mono text-foreground">{selectedLog.ipAddress || '—'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface border border-border">
                <span className="text-subtle block text-[10px] uppercase font-medium">Data</span>
                <span className="text-foreground">{new Date(selectedLog.createdAt).toLocaleTimeString('pt-PT')}</span>
              </div>
            </div>

            {/* Changes Diff: Old Values vs New Values */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Valores Anteriores
                  </h4>
                  <pre className="p-3 rounded-lg bg-surface border border-border text-[11px] font-mono text-muted overflow-x-auto max-h-56">
                    {selectedLog.oldValues
                      ? JSON.stringify(selectedLog.oldValues, null, 2)
                      : 'Nenhum valor anterior'}
                  </pre>
                </div>

                <div>
                  <h4 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Novos Valores
                  </h4>
                  <pre className="p-3 rounded-lg bg-surface border border-border text-[11px] font-mono text-foreground overflow-x-auto max-h-56">
                    {selectedLog.newValues
                      ? JSON.stringify(selectedLog.newValues, null, 2)
                      : 'Nenhum novo valor registado'}
                  </pre>
                </div>
              </div>

              {selectedLog.metadata && (
                <div className="pt-2">
                  <h4 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                    Metadados Adicionais
                  </h4>
                  <pre className="p-3 rounded-lg bg-surface border border-border text-[11px] font-mono text-muted overflow-x-auto max-h-32">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
