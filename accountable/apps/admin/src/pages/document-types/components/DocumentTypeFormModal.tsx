import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { DocumentTypeDTO } from '@accountable/types';
import { Button, Input, Spinner } from '@accountable/ui';
import { AlertCircle, FileText, X } from 'lucide-react';
import { adminApiService } from '../../../services/admin-api.service.js';
import {
  DOCUMENT_TYPE_CATEGORIES,
  apiErrorMessage,
  documentTypeFormSchema,
  emptyFormValues,
  invalidateDocumentTypes,
  toFormValues,
  toPayload,
  type DocumentTypeFormData,
} from '../document-type-form.js';

interface DocumentTypeFormModalProps {
  /** `null` → criação. */
  editingItem: DocumentTypeDTO | null;
  nextSortOrder: number;
  onClose: () => void;
}

export const DocumentTypeFormModal: React.FC<DocumentTypeFormModalProps> = ({
  editingItem,
  nextSortOrder,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DocumentTypeFormData>({
    resolver: zodResolver(documentTypeFormSchema),
    defaultValues: editingItem ? toFormValues(editingItem) : { ...emptyFormValues, sortOrder: nextSortOrder },
  });

  const save = useMutation({
    mutationFn: (data: DocumentTypeFormData) =>
      editingItem
        ? adminApiService.updateDocumentType(editingItem.id, toPayload(data))
        : adminApiService.createDocumentType(toPayload(data)),
    onSuccess: () => {
      invalidateDocumentTypes(queryClient);
      onClose();
    },
    onError: (err: unknown) =>
      setServerError(
        apiErrorMessage(
          err,
          editingItem
            ? 'Ocorreu um erro ao atualizar o tipo de documento.'
            : 'Ocorreu um erro ao criar o tipo de documento.',
        ),
      ),
  });

  const isFormActive = watch('isActive');
  const isFormRequired = watch('required');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-type-form-title"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h2
            id="document-type-form-title"
            className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>{editingItem ? 'Editar Tipo de Documento' : 'Novo Tipo de Documento'}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-md text-subtle hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((data) => {
            setServerError(null);
            save.mutate(data);
          })}
          className="space-y-3.5"
        >
          {serverError && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <Input
            label="Nome do Tipo de Documento *"
            placeholder="Ex: Comprovativo de Pagamento de Imposto"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Código Único (Slug) *"
              placeholder="Ex: comprovativo_imposto"
              error={errors.code?.message}
              {...register('code')}
            />

            <div className="space-y-1">
              <label htmlFor="document-type-category" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Categoria *
              </label>
              <select
                id="document-type-category"
                {...register('category')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
              >
                {DOCUMENT_TYPE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="document-type-description" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Descrição ou Instruções
            </label>
            <textarea
              id="document-type-description"
              rows={2}
              {...register('description')}
              placeholder="Orientação sobre que documento submeter neste slot..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Extensões Permitidas"
              placeholder=".pdf,.png,.jpg,.jpeg,.xlsx"
              error={errors.allowedExtensions?.message}
              {...register('allowedExtensions')}
            />
            <Input
              label="Ordem de Apresentação"
              type="number"
              placeholder="0"
              error={errors.sortOrder?.message}
              {...register('sortOrder')}
            />
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-6 border-t border-zinc-100 dark:border-zinc-800">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFormRequired}
                onChange={(e) => setValue('required', e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-900"
              />
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">Obrigatório no fecho mensal</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFormActive}
                onChange={(e) => setValue('isActive', e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-zinc-900"
              />
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">Slot Ativo</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? <Spinner size="sm" /> : editingItem ? 'Gravar Alterações' : 'Criar Tipo'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
