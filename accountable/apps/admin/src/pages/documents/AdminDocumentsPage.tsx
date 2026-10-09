import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminApiService } from '../../services/admin-api.service.js';
import type { DocumentStatus } from '@accountable/types';
import { DocumentsFilterBar } from './components/DocumentsFilterBar.js';
import { DocumentsTable } from './components/DocumentsTable.js';

/** Lista de processos. A gestão de cada processo abre na sua própria página (/documents/:id). */
export const AdminDocumentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const status = (searchParams.get('status') as DocumentStatus) || undefined;
  const search = searchParams.get('search') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'documents', { page, status, search }],
    queryFn: () => adminApiService.listDocuments({ page, perPage: 15, status, search: search || undefined }),
  });

  const updateParams = (updater: (params: URLSearchParams) => void): void => {
    const p = new URLSearchParams(searchParams);
    updater(p);
    setSearchParams(p);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">Tramitação de Processos</h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Acompanhe, altere estados de processo e consulte anexos submetidos por clientes
        </p>
      </div>

      <DocumentsFilterBar search={search} status={status} onChange={updateParams} />

      <DocumentsTable
        documents={data?.data ?? []}
        isLoading={isLoading}
        selectedDocId={null}
        onSelect={(id) => navigate(`/documents/${id}`)}
        page={page}
        totalPages={data?.totalPages ?? 1}
        total={data?.total ?? 0}
        onPageChange={(nextPage) => updateParams((p) => p.set('page', nextPage.toString()))}
      />
    </div>
  );
};
