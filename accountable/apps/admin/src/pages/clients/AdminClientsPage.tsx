import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { adminApiService } from '../../services/admin-api.service.js';
import type { ClientListItemDTO } from '@accountable/types';
import {
  Card,
  CardContent,
  Button,
  Spinner,
} from '@accountable/ui';
import {
  Search,
  Filter,
  Users,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  X,
  Building2,
  FileText,
  Mail,
  AlertCircle,
  Link2,
} from 'lucide-react';
import { ClientUploadSessionModal } from './components/ClientUploadSessionModal.js';

export const AdminClientsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const statusParam = searchParams.get('status');
  const isActive = statusParam === 'active' ? true : statusParam === 'blocked' ? false : undefined;

  const [selectedClient, setSelectedClient] = React.useState<ClientListItemDTO | null>(null);
  const [sessionModalClient, setSessionModalClient] = React.useState<ClientListItemDTO | null>(null);
  const [blockReason, setBlockReason] = React.useState('');
  const [blockError, setBlockError] = React.useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'clients', { page, search, isActive }],
    queryFn: () =>
      adminApiService.listClients({
        page,
        perPage: 15,
        search: search || undefined,
        isActive,
      }),
  });

  const blockMutation = useMutation({
    mutationFn: (vars: { id: string; reason: string }) =>
      adminApiService.blockClient(vars.id, { reason: vars.reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'clients'] });
      setSelectedClient(null);
      setBlockReason('');
    },
    onError: (err: unknown) => {
      setBlockError(err instanceof Error ? err.message : 'Falha ao bloquear cliente.');
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (id: string) => adminApiService.unblockClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'clients'] });
    },
  });

  const clients = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const handleBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    if (!blockReason.trim()) {
      setBlockError('Indique o motivo do bloqueio.');
      return;
    }
    blockMutation.mutate({
      id: selectedClient.id,
      reason: blockReason.trim(),
    });
  };

  return (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Gestão de Clientes</h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Consulte carteira de clientes, estado de conformidade e controle de acessos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            Total: {total} Clientes
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3.5 bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-none transition-colors">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-subtle absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Pesquisar por NIP, nome, empresa ou email..."
              value={search}
              onChange={(e) => {
                const p = new URLSearchParams(searchParams);
                if (e.target.value) p.set('search', e.target.value);
                else p.delete('search');
                p.set('page', '1');
                setSearchParams(p);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-subtle shrink-0" />
            <select
              value={statusParam || ''}
              onChange={(e) => {
                const p = new URLSearchParams(searchParams);
                if (e.target.value) p.set('status', e.target.value);
                else p.delete('status');
                p.set('page', '1');
                setSearchParams(p);
              }}
              aria-label="Filtrar por estado"
              className="text-xs sm:text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors"
            >
              <option value="">Todos os Estados</option>
              <option value="active">Ativos</option>
              <option value="blocked">Bloqueados</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Clients Table */}
      <Card className="bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 shadow-none overflow-hidden transition-colors">
        <CardContent className="p-0">
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-subtle">
              <Spinner size="lg" />
              <p className="text-xs">A carregar base de clientes...</p>
            </div>
          )}

          {!isLoading && clients.length === 0 && (
            <div className="py-16 text-center text-subtle space-y-2">
              <Users className="w-8 h-8 mx-auto text-subtle" />
              <p className="text-xs font-medium">Nenhum cliente encontrado com os critérios selecionados.</p>
            </div>
          )}

          {!isLoading && clients.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/90 text-zinc-500 dark:text-zinc-400 font-medium text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-5">Cliente</th>
                    <th className="py-3 px-4">NIP</th>
                    <th className="py-3 px-4">Empresa</th>
                    <th className="py-3 px-3">Processos</th>
                    <th className="py-3 px-4">Verificação</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Data Registo</th>
                    <th className="py-3 px-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5 px-5 font-medium text-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-semibold text-xs shrink-0 border border-zinc-200 dark:border-zinc-700/50">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate max-w-xs">
                            <span className="block font-medium truncate text-zinc-900 dark:text-zinc-100">{client.name}</span>
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-normal">
                              <Mail className="w-3 h-3 text-subtle" />
                              {client.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-zinc-600 dark:text-zinc-300">
                        {client.nip}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300">
                        {client.company ? (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-subtle" />
                            {client.company}
                          </span>
                        ) : (
                          <span className="text-subtle text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                          <FileText className="w-3 h-3 text-subtle" />
                          {client.documentsCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {client.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Verificado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {client.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                            <ShieldCheck className="w-3 h-3" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                            <ShieldAlert className="w-3 h-3" />
                            Bloqueado
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                        {new Date(client.createdAt).toLocaleDateString('pt-PT')}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSessionModalClient(client)}
                            className="text-xs gap-1"
                            title="Gerar Link de Envio Criptografado para o Cliente"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Link Envio</span>
                          </Button>
                          {client.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedClient(client);
                                setBlockError(null);
                                setBlockReason('');
                              }}
                              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-zinc-200 dark:border-zinc-800"
                            >
                              Bloquear
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              isLoading={unblockMutation.isPending}
                              onClick={() => unblockMutation.mutate(client.id)}
                              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border-zinc-200 dark:border-zinc-800"
                            >
                              Desbloquear
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
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

      {/* Block Client Confirmation Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl text-zinc-900 dark:text-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium text-sm">
                <ShieldAlert className="w-4 h-4" />
                <span>Bloquear Acesso de Cliente</span>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-subtle hover:text-zinc-700 dark:hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Está prestes a bloquear o acesso de{' '}
              <strong className="text-zinc-900 dark:text-white">{selectedClient.name}</strong> ({selectedClient.email}).
              O cliente ficará impedido de iniciar sessão e tramitar documentos.
            </p>

            {blockError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs">
                {blockError}
              </div>
            )}

            <form onSubmit={handleBlockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Motivo do Bloqueio (Auditoria) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Suspeita de fraude, pedido expresso de encerramento, etc."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full text-xs rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedClient(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={blockMutation.isPending}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Confirmar Bloqueio
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Client Upload Session Modal */}
      {sessionModalClient && (
        <ClientUploadSessionModal
          client={sessionModalClient}
          onClose={() => setSessionModalClient(null)}
        />
      )}
    </div>
  );
};

