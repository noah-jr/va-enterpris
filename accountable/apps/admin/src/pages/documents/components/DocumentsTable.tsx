import { Link } from 'react-router-dom';
import * as React from 'react';
import type { DocumentDTO, DocumentPriority } from '@accountable/types';
import { Card, CardContent, Button, DocumentStatusBadge, Spinner } from '@accountable/ui';
import { ChevronLeft, ChevronRight, FileText, Clock } from 'lucide-react';

export interface DocumentsTableProps {
  documents: DocumentDTO[];
  isLoading: boolean;
  selectedDocId: string | null;
  onSelect: (id: string) => void;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

const PRIORITY_DOT: Record<DocumentPriority, string> = {
  LOW: 'bg-zinc-500',
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

export const DocumentsTable: React.FC<DocumentsTableProps> = ({
  documents,
  isLoading,
  selectedDocId,
  onSelect,
  page,
  totalPages,
  total,
  onPageChange,
}) => {
  return (
    <Card className="bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-none overflow-hidden transition-colors">
      <CardContent className="p-0">
        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-subtle">
            <Spinner size="lg" />
            <p className="text-xs">A carregar processos...</p>
          </div>
        )}

        {!isLoading && documents.length === 0 && (
          <div className="py-16 text-center text-subtle space-y-2">
            <FileText className="w-8 h-8 mx-auto text-subtle" />
            <p className="text-xs font-medium">Nenhum processo encontrado com os filtros selecionados.</p>
          </div>
        )}

        {!isLoading && documents.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/90 text-zinc-500 dark:text-zinc-400 font-medium text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-5">Processo</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-3">Prioridade</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {documents.map((doc) => {
                  const isSelected = selectedDocId === doc.id;
                  return (
                    <tr
                      key={doc.id}
                      onClick={() => onSelect(doc.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-zinc-100 dark:bg-zinc-800/60 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700'
                          : 'hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30'
                      }`}
                    >
                      <td className="py-3 px-5 font-medium text-zinc-900 dark:text-zinc-100">
                        <span className="block font-medium text-zinc-900 dark:text-zinc-100">{doc.title}</span>
                        <span className="text-[11px] text-subtle font-mono">
                          ID: {doc.id.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300 font-normal">{doc.type}</td>
                      <td className="py-3 px-3">
                        {doc.priority === 'NORMAL' ? (
                          <span className="text-xs text-subtle">Normal</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                            <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[doc.priority]}`} />
                            {PRIORITY_LABEL[doc.priority]}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <DocumentStatusBadge status={doc.status} />
                      </td>
                      <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-subtle" />
                          {new Date(doc.createdAt).toLocaleDateString('pt-PT')}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <Link
                          to={`/documents/${doc.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          Gerir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs text-zinc-500 dark:text-zinc-400">
            <div>
              Página <span className="font-medium text-zinc-800 dark:text-zinc-200">{page}</span> de{' '}
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{totalPages}</span> ({total} registos)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="text-xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
