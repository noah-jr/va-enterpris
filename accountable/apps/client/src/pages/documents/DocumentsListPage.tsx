import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { documentService } from '../../services/document.service.js';
import type { DocumentStatus, DocumentPriority } from '@accountable/types';
import {
  Card,
  CardContent,
  Button,
  DocumentStatusBadge,
  Spinner,
} from '@accountable/ui';
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
} from 'lucide-react';

const STATUS_OPTIONS: Array<{ value: DocumentStatus | ''; label: string }> = [
  { value: '', label: 'Todos os Estados' },
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'SUBMITTED', label: 'Submetido' },
  { value: 'IN_ANALYSIS', label: 'Em Análise' },
  { value: 'AWAITING_DOCUMENT', label: 'Aguarda Documento' },
  { value: 'IN_PROCESSING', label: 'Em Processamento' },
  { value: 'REPLIED', label: 'Respondido' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

const PRIORITY_DOT: Record<DocumentPriority, string> = {
  LOW: 'bg-zinc-400',
  NORMAL: '',
  HIGH: 'bg-amber-500',
  URGENT: 'bg-rose-500',
};

const PRIORITY_LABEL: Record<DocumentPriority, string> = {
  LOW: 'Baixa',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export const DocumentsListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const status = (searchParams.get('status') as DocumentStatus) || undefined;
  const search = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = React.useState(search);

  const { data, isLoading } = useQuery({
    queryKey: ['documents', { page, status, search }],
    queryFn: () =>
      documentService.list({
        page,
        perPage: 15,
        status,
        search: search || undefined,
      }),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleStatusChange = (newStatus: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (newStatus) {
      newParams.set('status', newStatus);
    } else {
      newParams.delete('status');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const documents = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Processos Documentais
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Consulte, pesquise e acompanhe o estado de todos os seus processos submetidos
          </p>
        </div>

        <Link to="/documents/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Processo
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3 sm:p-3.5 bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-subtle absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Pesquisar processos..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
              />
            </div>
            <Button type="submit" variant="secondary" size="md" className="shrink-0">
              Pesquisar
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-subtle shrink-0" />
            <select
              value={status || ''}
              onChange={(e) => handleStatusChange(e.target.value)}
              aria-label="Filtrar por estado"
              className="w-full sm:w-auto text-xs sm:text-sm rounded-lg px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Table / Cards Card */}
      <Card className="overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
        <CardContent className="p-0">
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-subtle">
              <Spinner size="lg" />
              <p className="text-xs">A carregar processos documentais...</p>
            </div>
          )}

          {!isLoading && documents.length === 0 && (
            <div className="py-16 text-center space-y-3 px-4">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-subtle flex items-center justify-center mx-auto">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Nenhum processo encontrado</p>
              <p className="text-xs text-subtle max-w-sm mx-auto">
                Tente alterar os filtros de pesquisa ou inicie uma nova submissão documental.
              </p>
            </div>
          )}

          {!isLoading && documents.length > 0 && (
            <>
              {/* Mobile Card List View (< md) */}
              <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                {documents.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/documents/${doc.id}`}
                    className="p-4 flex flex-col gap-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors block"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 leading-snug">
                        {doc.title}
                      </h3>
                      <DocumentStatusBadge status={doc.status} size="sm" />
                    </div>

                    {doc.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {doc.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-subtle pt-1 border-t border-zinc-100/60 dark:border-zinc-800/40">
                      <span className="font-medium text-zinc-600 dark:text-zinc-300">
                        {doc.type}
                      </span>

                      <span className="inline-flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(doc.createdAt).toLocaleDateString('pt-PT', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop Data Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 font-medium text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-5">Processo</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Prioridade</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Submetido em</th>
                      <th className="py-3 px-5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                    {documents.map((doc) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors group"
                      >
                        <td className="py-3.5 px-5 font-medium text-zinc-900 dark:text-zinc-100">
                          <Link
                            to={`/documents/${doc.id}`}
                            className="hover:text-zinc-900 dark:hover:text-white transition-colors block"
                          >
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                              {doc.title}
                            </span>
                            {doc.description && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5 font-normal">
                                {doc.description}
                              </p>
                            )}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300 font-normal">
                          {doc.type}
                        </td>
                        <td className="py-3.5 px-4">
                          {doc.priority === 'NORMAL' ? (
                            <span className="text-xs text-subtle">Normal</span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                              <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[doc.priority]}`} />
                              {PRIORITY_LABEL[doc.priority]}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <DocumentStatusBadge status={doc.status} />
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400 text-xs">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-subtle" />
                            {new Date(doc.createdAt).toLocaleDateString('pt-PT', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <Link to={`/documents/${doc.id}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              Ver Detalhes
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/30 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="text-center sm:text-left">
                Página <span className="font-medium text-zinc-900 dark:text-zinc-200">{page}</span> de{' '}
                <span className="font-medium text-zinc-900 dark:text-zinc-200">{totalPages}</span> ({total} resultados)
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="flex-1 sm:flex-initial gap-1 text-xs justify-center"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="flex-1 sm:flex-initial gap-1 text-xs justify-center"
                >
                  Seguinte
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
