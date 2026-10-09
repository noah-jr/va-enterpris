import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApiService } from '../../services/admin-api.service.js';
import type { BackupDTO, BackupType } from '@accountable/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Spinner,
} from '@accountable/ui';
import {
  HardDrive,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Hash,
  ShieldCheck,
  Database,
  Archive,
} from 'lucide-react';

export const AdminBackupsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'backups'],
    queryFn: () => adminApiService.listBackups(),
  });

  const createBackupMutation = useMutation({
    mutationFn: (type: BackupType) => adminApiService.createBackup(type),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'backups'] });
      setFeedbackMessage(`Cópia de segurança (${res.data.type}) iniciada com sucesso!`);
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
    onError: () => {
      setFeedbackMessage('Falha ao iniciar processo de cópia de segurança.');
      setTimeout(() => setFeedbackMessage(null), 5000);
    },
  });

  const backups = data?.data ?? [];

  const formatBytes = (bytes: number | null) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getStatusBadge = (status: BackupDTO['status']) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Concluído
          </span>
        );
      case 'IN_PROGRESS':
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface-muted text-muted border border-border animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Em Processamento
          </span>
        );
      case 'FAILED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
            <AlertTriangle className="w-3.5 h-3.5" />
            Falha
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">Cópias de Segurança & Recuperação</h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Política de backup integrada: base de dados relacional MySQL + repositório MinIO
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            isLoading={createBackupMutation.isPending}
            onClick={() => createBackupMutation.mutate('INCREMENTAL')}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Backup Incremental
          </Button>
          <Button
            size="sm"
            isLoading={createBackupMutation.isPending}
            onClick={() => createBackupMutation.mutate('FULL')}
            className="gap-1.5 text-xs"
          >
            <Archive className="w-3.5 h-3.5" />
            Novo Backup Completo
          </Button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3 rounded-lg bg-surface border border-border text-foreground text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Info Banner */}
      <Card className="bg-surface/60 border-border/80">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-muted text-muted flex items-center justify-center shrink-0 border border-border/50">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-xs sm:text-sm text-foreground">Salvaguarda Total de Metadados e Ficheiros</p>
              <p className="text-xs text-muted">
                Cada snapshot gera verificação criptográfica SHA-256 e armazena registos e ficheiros físicos de forma atómica.
              </p>
            </div>
          </div>
          <div className="text-xs text-muted whitespace-nowrap">
            Retenção: <strong className="text-foreground">90 dias</strong> | Encriptação: <strong className="text-foreground">AES-256</strong>
          </div>
        </CardContent>
      </Card>

      {/* Backups Table */}
      <Card className="bg-surface/60 border-border/80 overflow-hidden">
        <CardHeader className="border-b border-border/80 pb-3">
          <CardTitle className="text-foreground text-sm">Histórico de Cópias de Segurança</CardTitle>
          <CardDescription className="text-muted text-xs">
            Lista de snapshots gerados pelo sistema ou por ação manual de administradores
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-subtle">
              <Spinner size="lg" />
              <p className="text-xs">A carregar histórico de cópias de segurança...</p>
            </div>
          )}

          {!isLoading && backups.length === 0 && (
            <div className="py-16 text-center text-subtle space-y-2">
              <HardDrive className="w-8 h-8 mx-auto text-muted" />
              <p className="text-xs">Nenhuma cópia de segurança registada até ao momento.</p>
            </div>
          )}

          {!isLoading && backups.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border/80 bg-surface/90 text-muted font-medium text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-5">ID do Snapshot</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Tamanho</th>
                    <th className="py-3 px-4">Checksum (SHA-256)</th>
                    <th className="py-3 px-4">Iniciado em</th>
                    <th className="py-3 px-4">Concluído em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-xs">
                  {backups.map((b) => (
                    <tr key={b.id} className="hover:bg-surface-muted/30 transition-colors">
                      <td className="py-3.5 px-5 font-medium text-foreground flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-subtle shrink-0" />
                        <span className="font-mono text-foreground truncate max-w-[140px]">{b.id}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                            b.type === 'FULL'
                              ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
                              : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                          }`}
                        >
                          {b.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(b.status)}</td>
                      <td className="py-3.5 px-4 text-muted font-mono text-[11px]">
                        {formatBytes(b.size)}
                      </td>
                      <td className="py-3.5 px-4 text-muted font-mono text-[11px]">
                        {b.checksum ? (
                          <span className="flex items-center gap-1 truncate max-w-[160px]" title={b.checksum}>
                            <Hash className="w-3.5 h-3.5 text-subtle shrink-0" />
                            {b.checksum.substring(0, 16)}...
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-muted">
                        {new Date(b.createdAt).toLocaleString('pt-PT')}
                      </td>
                      <td className="py-3.5 px-4 text-muted">
                        {b.completedAt ? new Date(b.completedAt).toLocaleString('pt-PT') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
