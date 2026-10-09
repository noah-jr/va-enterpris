import { z } from 'zod';
import type { QueryClient } from '@tanstack/react-query';
import type { DocumentTypeDTO } from '@accountable/types';

export const documentTypeFormSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres').max(255),
  code: z
    .string()
    .min(2, 'O código deve ter pelo menos 2 caracteres')
    .max(100)
    .regex(/^[a-z0-9_-]+$/i, 'Apenas letras, números, hífen e underscore'),
  category: z.string().min(1, 'Categoria é obrigatória').max(100),
  description: z.string().max(1000).optional(),
  allowedExtensions: z.string().max(255).optional(),
  required: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

export type DocumentTypeFormData = z.infer<typeof documentTypeFormSchema>;

export const emptyFormValues: DocumentTypeFormData = {
  name: '',
  code: '',
  category: 'Fiscal',
  description: '',
  allowedExtensions: '.pdf,.png,.jpg,.jpeg',
  required: true,
  isActive: true,
  sortOrder: 0,
};

export const DOCUMENT_TYPE_CATEGORIES = [
  'Fiscal',
  'Contabilidade',
  'Bancário',
  'Tesouraria',
  'Recursos Humanos',
  'Fiscal/Social',
  'Geral',
];

export const CATEGORY_FILTERS = ['Todos', ...DOCUMENT_TYPE_CATEGORIES];

export function toFormValues(item: DocumentTypeDTO): DocumentTypeFormData {
  return {
    name: item.name,
    code: item.code,
    category: item.category,
    description: item.description ?? '',
    allowedExtensions: item.allowedExtensions ?? '',
    required: item.required,
    isActive: item.isActive,
    sortOrder: item.sortOrder,
  };
}

export function toPayload(data: DocumentTypeFormData) {
  return {
    ...data,
    description: data.description?.trim() || null,
    allowedExtensions: data.allowedExtensions?.trim() || null,
  };
}

/** Admin e portal do cliente usam a mesma lista — invalidar ambas. */
export function invalidateDocumentTypes(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: ['admin', 'document-types'] });
  queryClient.invalidateQueries({ queryKey: ['public', 'document-types'] });
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;
}

export const categoryBadgeStyle = (category: string) => {
  switch (category.toLowerCase()) {
    case 'fiscal':
    case 'fiscal/social':
      return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60';
    case 'contabilidade':
      return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/60';
    case 'bancário':
      return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60';
    case 'tesouraria':
      return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/60';
    case 'recursos humanos':
      return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/60';
    default:
      return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
  }
};
