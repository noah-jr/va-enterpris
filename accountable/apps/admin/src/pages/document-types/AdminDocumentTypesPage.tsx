import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApiService } from '../../services/admin-api.service.js';
import { useAdminAuthStore } from '../../stores/admin-auth.store.js';
import type { DocumentTypeDTO } from '@accountable/types';
import { Card, CardContent, Button, Spinner } from '@accountable/ui';
import { FileText, Plus, Pencil, Trash2, Filter, Search, Tag } from 'lucide-react';
import {
  CATEGORY_FILTERS as CATEGORIES,
  categoryBadgeStyle,
  invalidateDocumentTypes,
} from './document-type-form.js';
import { DocumentTypeFormModal } from './components/DocumentTypeFormModal.js';
import { DeleteDocumentTypeDialog } from './components/DeleteDocumentTypeDialog.js';

type FormState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; item: DocumentTypeDTO };

export const AdminDocumentTypesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = useAdminAuthStore();
  // Tem de coincidir com a permissão exigida pela API nas rotas /admin/document-types.
  const canManage = hasPermission('document_types:manage');

  const [formState, setFormState] = React.useState<FormState>({ mode: 'closed' });
  const [deleteTarget, setDeleteTarget] = React.useState<DocumentTypeDTO | null>(null);

  // Filters
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Todos');
  const [statusFilter, setStatusFilter] = React.useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin', 'document-types'],
    queryFn: () => adminApiService.listDocumentTypes(),
  });

  const documentTypes: DocumentTypeDTO[] = React.useMemo(() => {
    let items = response?.data ?? [];
    if (selectedCategory !== 'Todos') {
      items = items.filter((it) => it.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (statusFilter === 'ACTIVE') {
      items = items.filter((it) => it.isActive);
    } else if (statusFilter === 'INACTIVE') {
      items = items.filter((it) => !it.isActive);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.code.toLowerCase().includes(q) ||
          (it.description && it.description.toLowerCase().includes(q)),
      );
    }
    return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [response, selectedCategory, statusFilter, search]);

  const openCreateModal = () => setFormState({ mode: 'create' });
  const openEditModal = (item: DocumentTypeDTO) => setFormState({ mode: 'edit', item });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApiService.updateDocumentType(id, { isActive }),
    onSuccess: () => invalidateDocumentTypes(queryClient),
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Tipos de Documento & Slots
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              {documentTypes.length}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Gestão dos slots dinâmicos e requisitos solicitados aos clientes nas submissões e fechos mensais.
          </p>
        </div>

        {canManage && (
          <Button
            onClick={openCreateModal}
            className="flex items-center gap-2 self-start sm:self-auto shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Tipo</span>
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <Card className="border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-xs">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar por nome, código ou descrição..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
              />
            </div>

            {/* Category and Status Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-subtle" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900/60">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    statusFilter === 'ALL'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ACTIVE')}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    statusFilter === 'ACTIVE'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Ativos
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('INACTIVE')}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    statusFilter === 'INACTIVE'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Inativos
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table / List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="text-xs text-subtle mt-3">A carregar tipos de documento...</p>
        </div>
      ) : documentTypes.length === 0 ? (
        <Card className="border-dashed border-zinc-300 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50">
          <CardContent className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto text-subtle">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Nenhum tipo de documento encontrado
            </h3>
            <p className="text-xs text-subtle max-w-sm mx-auto">
              {search || selectedCategory !== 'Todos' || statusFilter !== 'ALL'
                ? 'Nenhum resultado corresponde aos filtros selecionados.'
                : 'Ainda não foram configurados tipos de documentos.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 dark:bg-zinc-900/50 border-b border-zinc-200/80 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 font-medium">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Nome & Código</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Obrigatoriedade</th>
                  <th className="py-3 px-4">Extensões</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                {documentTypes.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors ${
                      !item.isActive ? 'opacity-60 bg-zinc-50/30 dark:bg-zinc-950/30' : ''
                    }`}
                  >
                    {/* Sort Order */}
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-subtle">
                      {item.sortOrder}
                    </td>

                    {/* Name & Code */}
                    <td className="py-3.5 px-4 min-w-[220px]">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                          {item.code}
                        </code>
                        {item.description && (
                          <span
                            className="text-[11px] text-subtle truncate max-w-xs"
                            title={item.description}
                          >
                            — {item.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${categoryBadgeStyle(
                          item.category,
                        )}`}
                      >
                        <Tag className="w-3 h-3" />
                        {item.category}
                      </span>
                    </td>

                    {/* Required */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.required ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                          Obrigatório
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                          Opcional
                        </span>
                      )}
                    </td>

                    {/* Allowed Extensions */}
                    <td className="py-3.5 px-4 text-[11px] text-subtle font-mono">
                      {item.allowedExtensions || 'Todos'}
                    </td>

                    {/* State Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        disabled={!canManage || toggleStatusMutation.isPending}
                        onClick={() =>
                          toggleStatusMutation.mutate({
                            id: item.id,
                            isActive: !item.isActive,
                          })
                        }
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                          item.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-100'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isActive ? 'bg-emerald-500' : 'bg-zinc-400'
                          }`}
                        />
                        <span>{item.isActive ? 'Ativo' : 'Inativo'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {canManage && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            title="Editar Tipo"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            title="Eliminar Tipo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {formState.mode !== 'closed' && (
        <DocumentTypeFormModal
          editingItem={formState.mode === 'edit' ? formState.item : null}
          nextSortOrder={(response?.data?.length ?? 0) + 1}
          onClose={() => setFormState({ mode: 'closed' })}
        />
      )}

      {deleteTarget && <DeleteDocumentTypeDialog target={deleteTarget} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
};
