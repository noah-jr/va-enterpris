import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { adminApiService } from '../../services/admin-api.service.js';
import { useAdminAuthStore } from '../../stores/admin-auth.store.js';
import type { ContactRequestDTO } from '@accountable/types';
import { Card, CardContent, Button, Spinner } from '@accountable/ui';
import { Inbox, ChevronLeft, ChevronRight, Eye, X, AlertCircle, Mail, Building2, Phone } from 'lucide-react';

const STATUS_LABEL: Record<ContactRequestDTO['status'], string> = {
  NEW: 'Novo',
  CONTACTED: 'Contactado',
  CLOSED: 'Fechado',
};

const getStatusBadgeClass = (status: ContactRequestDTO['status']): string => {
  if (status === 'NEW') return 'bg-surface-muted text-foreground border-border';
  if (status === 'CONTACTED') return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60';
  return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60';
};

const truncate = (text: string, length: number): string =>
  text.length > length ? `${text.substring(0, length)}...` : text;

export const AdminLeadsPage: React.FC = () => {
  const { hasPermission } = useAdminAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = React.useState<ContactRequestDTO | null>(null);

  const page = parseInt(searchParams.get('page') || '1', 10);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'contact-requests', { page }],
    queryFn: () => adminApiService.listContactRequests({ page, perPage: 25 }),
    enabled: hasPermission('contacts:read'),
  });

  const leads = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  if (!hasPermission('contacts:read')) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-surface border border-border rounded-xl p-8 space-y-4 text-center">
        <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Acesso Negado</h2>
        <p className="text-xs text-muted">Não tem permissão para consultar os pedidos de contacto.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">Pedidos de Contacto</h1>
          <p className="text-xs sm:text-sm text-muted mt-1">Submissões recebidas através do formulário de contacto do site</p>
        </div>

        <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-surface border border-border text-muted flex items-center gap-1.5">
          <Inbox className="w-3.5 h-3.5 text-muted" />
          Total: {total} Pedidos
        </span>
      </div>

      <Card className="bg-surface/60 border-border/80 overflow-hidden">
        <CardContent className="p-0">
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-subtle">
              <Spinner size="lg" />
              <p className="text-xs">A carregar pedidos de contacto...</p>
            </div>
          )}

          {!isLoading && leads.length === 0 && (
            <div className="py-16 text-center text-subtle space-y-2">
              <Inbox className="w-8 h-8 mx-auto text-muted" />
              <p className="text-xs">Nenhum pedido de contacto recebido.</p>
            </div>
          )}

          {!isLoading && leads.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border/80 bg-surface/90 text-muted font-medium text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-5">Nome</th>
                    <th className="py-3 px-4">Empresa</th>
                    <th className="py-3 px-4">Mensagem</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-5 text-right">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-surface-muted/30 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="block font-medium text-foreground">{lead.name}</span>
                        <span className="block text-[11px] text-subtle">{lead.email}</span>
                      </td>
                      <td className="py-3.5 px-4 text-muted text-xs">{lead.company || '—'}</td>
                      <td className="py-3.5 px-4 text-muted text-xs max-w-xs">
                        {truncate(lead.message, 60)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium border ${getStatusBadgeClass(
                            lead.status,
                          )}`}
                        >
                          {STATUS_LABEL[lead.status]}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-muted text-xs">
                        {new Date(lead.createdAt).toLocaleString('pt-PT')}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelected(lead)}
                          className="text-xs gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border/80 bg-surface/40 text-xs text-muted">
              <div>
                Página <span className="font-medium text-foreground">{page}</span> de{' '}
                <span className="font-medium text-foreground">{totalPages}</span> ({total} pedidos)
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

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-foreground font-medium text-sm">
                <Inbox className="w-4 h-4 text-muted" />
                <span>Pedido de Contacto</span>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted hover:text-foreground p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase text-subtle font-medium">Nome</span>
                <p className="text-foreground font-medium text-sm">{selected.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase text-subtle font-medium flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </span>
                  <p className="text-foreground text-xs sm:text-sm">{selected.email}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-subtle font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Telefone
                  </span>
                  <p className="text-foreground text-xs sm:text-sm">{selected.phone || '—'}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase text-subtle font-medium flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Empresa
                </span>
                <p className="text-foreground text-xs sm:text-sm">{selected.company || '—'}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase text-subtle font-medium">Mensagem</span>
                <p className="text-foreground text-xs sm:text-sm whitespace-pre-wrap bg-surface border border-border rounded-lg p-3 mt-1 leading-relaxed">
                  {selected.message}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium border ${getStatusBadgeClass(
                    selected.status,
                  )}`}
                >
                  {STATUS_LABEL[selected.status]}
                </span>
                <span className="text-xs text-subtle">
                  {new Date(selected.createdAt).toLocaleString('pt-PT')}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelected(null)}
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
