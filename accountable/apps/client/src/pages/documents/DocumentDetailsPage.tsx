import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../../services/document.service.js';
import { messageService } from '../../services/message.service.js';
import type { DocumentStatus } from '@accountable/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  DocumentStatusBadge,
  DocumentViewer,
  Spinner,
} from '@accountable/ui';
import {
  ArrowLeft,
  Eye,
  FileText,
  Clock,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  History,
  Send,
} from 'lucide-react';

const MessageThread: React.FC<{ documentId: string }> = ({ documentId }) => {
  const queryClient = useQueryClient();
  const [content, setContent] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['document-messages', documentId],
    queryFn: () => messageService.list(documentId),
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: () => messageService.send(documentId, { content, isInternal: false }),
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['document-messages', documentId] });
    },
  });

  const messages = data?.data ?? [];

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <CardTitle>Mensagens</CardTitle>
        <CardDescription>Comunicação com a equipa sobre este processo</CardDescription>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {isLoading && <Spinner />}
        {!isLoading && messages.length === 0 && (
          <p className="text-xs text-subtle text-center py-4">Ainda não há mensagens neste processo.</p>
        )}
        <div className="space-y-2.5 max-h-80 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.senderType === 'CLIENT'
                  ? 'ml-auto max-w-[80%] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl px-3.5 py-2 text-xs shadow-sm'
                  : 'mr-auto max-w-[80%] bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 rounded-xl px-3.5 py-2 text-xs border border-zinc-200/60 dark:border-zinc-700/50'
              }
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p
                className={`text-[10px] mt-1 ${
                  msg.senderType === 'CLIENT'
                    ? 'text-subtle'
                    : 'text-subtle'
                }`}
              >
                {new Date(msg.createdAt).toLocaleString('pt-PT')}
              </p>
            </div>
          ))}
        </div>
        <form
          className="flex items-center gap-2 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (content.trim()) sendMutation.mutate();
          }}
        >
          <Input
            placeholder="Escreva uma mensagem..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button
            type="submit"
            size="sm"
            isLoading={sendMutation.isPending}
            disabled={!content.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const WORKFLOW_STEPS: Array<{ key: DocumentStatus; label: string }> = [
  { key: 'SUBMITTED', label: 'Submetido' },
  { key: 'IN_ANALYSIS', label: 'Em Análise' },
  { key: 'AWAITING_DOCUMENT', label: 'Aguarda Doc.' },
  { key: 'IN_PROCESSING', label: 'Processamento' },
  { key: 'REPLIED', label: 'Respondido' },
  { key: 'COMPLETED', label: 'Concluído' },
];

export const DocumentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['document', id],
    queryFn: () => documentService.getById(id!),
    enabled: !!id,
  });

  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);
  const openViewer = async (index: number) => {
    // Os links de download expiram em 15 min: renova-os antes de abrir.
    await refetch();
    setViewerIndex(index);
  };

  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentService.uploadFile(id!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-subtle">
        <Spinner size="lg" />
        <p className="text-xs">A carregar detalhes do processo...</p>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Processo Não Encontrado</h2>
        <p className="text-xs text-subtle">
          O processo solicitado não existe ou não possui permissão para aceder ao mesmo.
        </p>
        <Link to="/documents">
          <Button variant="outline">Voltar à Lista</Button>
        </Link>
      </div>
    );
  }

  const { document, files, statusHistory } = data.data;

  // Determinar o passo atual do fluxo
  const currentStepIdx = WORKFLOW_STEPS.findIndex((s) => s.key === document.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button and page title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/documents"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Processos
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {document.title}
            </h1>
            <DocumentStatusBadge status={document.status} />
          </div>
          <p className="text-xs text-subtle">
            ID: <span className="font-mono text-zinc-700 dark:text-zinc-300">{document.id}</span> • Criado em{' '}
            {new Date(document.createdAt).toLocaleString('pt-PT')}
          </p>
        </div>

        {/* Upload file trigger */}
        {!['COMPLETED', 'ARCHIVED', 'CANCELLED'].includes(document.status) && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              isLoading={uploadMutation.isPending}
              className="gap-2"
              size="sm"
            >
              <UploadCloud className="w-4 h-4" />
              Anexar Novo Ficheiro
            </Button>
          </div>
        )}
      </div>

      {/* Workflow Stepper */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-subtle mb-3.5 sm:mb-4">
          Etapas de Tramitação
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
          {WORKFLOW_STEPS.map((step, idx) => {
            const isDone = currentStepIdx > idx;
            const isCurrent = currentStepIdx === idx;

            return (
              <div
                key={step.key}
                className="flex items-center md:flex-col md:items-center gap-2.5 md:gap-2 flex-1 relative z-10"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-colors shrink-0 ${
                    isDone
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                      : isCurrent
                        ? 'bg-zinc-900/10 text-zinc-900 dark:bg-zinc-100/10 dark:text-zinc-100 ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-subtle'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <div className="min-w-0 md:text-center">
                  <p
                    className={`text-xs truncate ${
                      isCurrent
                        ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                        : isDone
                          ? 'text-zinc-700 dark:text-zinc-300 font-medium'
                          : 'text-zinc-400'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Attached Files */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Details */}
          <Card className="bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle>Informação do Processo</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-subtle block mb-1">Tipo de Processo</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{document.type}</span>
                </div>
                <div>
                  <span className="text-subtle block mb-1">Prioridade</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{document.priority}</span>
                </div>
              </div>

              {document.description && (
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-subtle block text-xs mb-1">Descrição / Instruções</span>
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {document.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attached Files List */}
          <Card className="bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ficheiros Anexados ({files.length})</CardTitle>
                <CardDescription>Documentos associados ao processo</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {files.length === 0 && (
                <div className="py-8 text-center text-subtle text-xs">
                  Nenhum ficheiro anexado a este processo.
                </div>
              )}

              {files.length > 0 && (
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {files.map((file, fileIndex) => (
                    <li
                      key={file.id}
                      className="p-3.5 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{file.originalName}</p>
                          <p className="text-[11px] text-subtle mt-0.5 font-mono">
                            {(file.size / 1024).toFixed(1)} KB •{' '}
                            {new Date(file.createdAt).toLocaleDateString('pt-PT')}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewer(fileIndex)}
                        data-testid={`open-file-${file.originalName}`}
                        className="w-full sm:w-auto justify-center gap-1.5 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Visualizar
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {id && <MessageThread documentId={id} />}

          {viewerIndex !== null && (
            <DocumentViewer files={files} initialIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
          )}
        </div>

        {/* Right Column: Status History Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-subtle" />
                <CardTitle className="text-sm">Histórico de Alterações</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="relative pl-5 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-zinc-200 dark:before:bg-zinc-800">
                {statusHistory.map((item, idx) => (
                  <div key={item.id || idx} className="relative group">
                    <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 ring-4 ring-white dark:ring-zinc-900" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <DocumentStatusBadge status={item.toStatus as DocumentStatus} size="sm" />
                        <span className="text-[10px] text-subtle flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleTimeString('pt-PT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 pt-1 leading-normal">{item.note}</p>
                      )}
                      <p className="text-[10px] text-subtle">
                        {new Date(item.createdAt).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
