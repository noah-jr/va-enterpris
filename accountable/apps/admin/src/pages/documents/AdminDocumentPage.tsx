import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiError, DocumentStatus } from '@accountable/types';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DocumentStatusBadge,
  DocumentViewer,
  Spinner,
  formatDate,
} from '@accountable/ui';
import { ArrowLeft, Check, Clock, Eye, FileText, Image as ImageIcon, Sheet } from 'lucide-react';
import { adminApiService } from '../../services/admin-api.service.js';
import { useAdminAuthStore } from '../../stores/admin-auth.store.js';
import { AdminMessageThread } from './components/AdminMessageThread.js';
import { DocumentUploadLinkSection } from './components/DocumentUploadLinkSection.js';
import { NEXT_STATUSES, STATUS_LABELS } from './components/document-status.constants.js';

const fileIcon = (mime: string) =>
  mime.startsWith('image/') ? ImageIcon : mime.includes('sheet') || mime.includes('excel') || mime === 'text/csv' ? Sheet : FileText;

/** Página de gestão (tramitação) de um processo — aberta a partir da lista de processos. */
export const AdminDocumentPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { hasPermission } = useAdminAuthStore();
  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);
  const [newStatus, setNewStatus] = React.useState<DocumentStatus | ''>('');
  const [note, setNote] = React.useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'document', id],
    queryFn: () => adminApiService.getDocument(id),
    enabled: Boolean(id),
  });

  const updateStatus = useMutation({
    mutationFn: () => adminApiService.updateDocumentStatus(id, { status: newStatus as DocumentStatus, note: note.trim() || undefined }),
    onSuccess: () => {
      setNote('');
      setNewStatus('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'document', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] });
    },
  });

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center space-y-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Processo não encontrado ou sem permissão de acesso.</p>
        <Link to="/documents" className="text-sm font-medium text-zinc-900 dark:text-zinc-100 underline">
          Voltar aos processos
        </Link>
      </div>
    );
  }

  const { document: doc, files, statusHistory } = data.data;
  const nextStatuses = NEXT_STATUSES[doc.status];
  const canChangeStatus = hasPermission('documents:change_status');

  const openViewer = async (index: number) => {
    // Os links de download expiram em 15 min — renova antes de abrir se a página estiver aberta há muito.
    await refetch();
    setViewerIndex(index);
  };

  return (
    <div className="space-y-6" data-testid="document-management-page">
      <div className="flex flex-col gap-3">
        <Link
          to="/documents"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar aos processos
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{doc.title}</h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {doc.client?.name} · NIF {doc.client?.nip} · {doc.type} · criado a {formatDate(doc.createdAt)}
            </p>
          </div>
          <DocumentStatusBadge status={doc.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Documentos anexados ({files.length})</CardTitle>
              <CardDescription>Clique para visualizar dentro da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Nenhum ficheiro anexado.</p>
              ) : (
                <ul className="grid sm:grid-cols-2 gap-3">
                  {files.map((file, i) => {
                    const Icon = fileIcon(file.mimeType);
                    return (
                      <li key={file.id}>
                        <button
                          type="button"
                          onClick={() => openViewer(i)}
                          data-testid={`open-file-${file.originalName}`}
                          className="w-full text-left p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 hover:border-zinc-400 dark:hover:border-zinc-600 flex items-center gap-3 transition-colors"
                        >
                          <Icon className="w-5 h-5 text-zinc-500 shrink-0" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{file.originalName}</span>
                            <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                              {(file.size / 1024).toFixed(1)} KB · {file.uploaderType === 'CLIENT' ? 'Enviado pelo cliente' : 'Enviado pela equipa'} ·{' '}
                              {formatDate(file.createdAt)}
                            </span>
                          </span>
                          <Eye className="w-4 h-4 text-zinc-500 shrink-0" aria-label="Visualizar" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Mensagens</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminMessageThread documentId={id} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {canChangeStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tramitação</CardTitle>
                <CardDescription>Alterar o estado do processo (o cliente é notificado por email)</CardDescription>
              </CardHeader>
              <CardContent>
                {nextStatuses.length === 0 ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Este processo está num estado final.</p>
                ) : (
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newStatus) updateStatus.mutate();
                    }}
                  >
                    <select
                      aria-label="Selecionar novo estado"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as DocumentStatus)}
                      className="w-full text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-2 text-zinc-800 dark:text-zinc-200"
                    >
                      <option value="">Escolher novo estado…</option>
                      {nextStatuses.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                    <textarea
                      rows={3}
                      placeholder="Nota explicativa para o cliente ou auditoria…"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-2 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-500 resize-y"
                    />
                    {updateStatus.isError && (
                      <Alert tone="danger">
                        {(updateStatus.error as AxiosError<ApiError>).response?.data?.message ?? 'Não foi possível alterar o estado.'}
                      </Alert>
                    )}
                    {updateStatus.isSuccess && <Alert tone="success">Estado atualizado.</Alert>}
                    <Button type="submit" className="w-full gap-1.5" isLoading={updateStatus.isPending} disabled={!newStatus}>
                      <Check className="w-4 h-4" /> Atualizar Estado
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {hasPermission('documents:request_file') && (
            <Card>
              <CardContent className="pt-6">
                <DocumentUploadLinkSection documentId={id} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3" data-testid="status-history">
                {[...statusHistory].reverse().map((h) => (
                  <li key={h.id} className="flex gap-3 text-xs">
                    <Clock className="w-3.5 h-3.5 mt-0.5 text-zinc-500 shrink-0" />
                    <div>
                      <p className="text-zinc-900 dark:text-zinc-100 font-medium">
                        {h.fromStatus ? `${STATUS_LABELS[h.fromStatus as DocumentStatus] ?? h.fromStatus} → ` : ''}
                        {STATUS_LABELS[h.toStatus as DocumentStatus] ?? h.toStatus}
                      </p>
                      {h.note && <p className="text-zinc-600 dark:text-zinc-400">{h.note}</p>}
                      <p className="text-zinc-500 dark:text-zinc-500">{new Date(h.createdAt).toLocaleString('pt-PT')}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {viewerIndex !== null && <DocumentViewer files={files} initialIndex={viewerIndex} onClose={() => setViewerIndex(null)} />}
    </div>
  );
};
