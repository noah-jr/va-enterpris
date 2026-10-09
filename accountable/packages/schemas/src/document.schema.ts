import { z } from 'zod';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const DOCUMENT_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;

export const DOCUMENT_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'IN_ANALYSIS',
  'AWAITING_DOCUMENT',
  'IN_PROCESSING',
  'REPLIED',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
  'ARCHIVED',
] as const;

export const createDocumentSchema = z.object({
  title: z.string().min(3, 'Título demasiado curto').max(255, 'Título demasiado longo').trim(),
  description: z.string().max(5000, 'Descrição demasiado longa').trim().optional(),
  type: z.string().min(1, 'Tipo é obrigatório').max(100).trim(),
  priority: z.enum(DOCUMENT_PRIORITIES).optional().default('NORMAL'),
});

export const updateDocumentStatusSchema = z.object({
  status: z.enum(DOCUMENT_STATUSES),
  note: z.string().max(1000).trim().optional(),
});

export const createDocumentRequestSchema = z.object({
  documentId: z.string().uuid('ID do documento inválido'),
  items: z
    .array(
      z.object({
        label: z.string().min(2, 'Rótulo obrigatório').max(255).trim(),
        description: z.string().max(1000).trim().optional(),
        required: z.boolean().optional().default(true),
      }),
    )
    .min(1, 'Pelo menos um documento deve ser solicitado')
    .max(20, 'Máximo de 20 documentos por solicitação'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  perPage: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const documentFilterSchema = paginationSchema.extend({
  status: z.enum(DOCUMENT_STATUSES).optional(),
  priority: z.enum(DOCUMENT_PRIORITIES).optional(),
  clientId: z.string().uuid().optional(),
  search: z.string().max(255).trim().optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentStatusInput = z.infer<typeof updateDocumentStatusSchema>;
export type CreateDocumentRequestInput = z.infer<typeof createDocumentRequestSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type DocumentFilterInput = z.infer<typeof documentFilterSchema>;

// ============================================================
// Document Types (Templates de Slots)
// ============================================================

export const createDocumentTypeSchema = z.object({
  code: z
    .string()
    .min(2, 'O código deve ter pelo menos 2 caracteres')
    .max(100, 'O código não pode exceder 100 caracteres')
    .regex(/^[a-z0-9_-]+$/i, 'O código só pode conter letras, números, hífen e underscore')
    .trim(),
  name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(255, 'O nome não pode exceder 255 caracteres')
    .trim(),
  description: z.string().max(1000).trim().nullable().optional(),
  category: z.string().min(1).max(100).trim().optional().default('Geral'),
  required: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional().default(0),
  allowedExtensions: z.string().max(255).trim().nullable().optional(),
});

export const updateDocumentTypeSchema = z.object({
  code: z
    .string()
    .min(2, 'O código deve ter pelo menos 2 caracteres')
    .max(100, 'O código não pode exceder 100 caracteres')
    .regex(/^[a-z0-9_-]+$/i, 'O código só pode conter letras, números, hífen e underscore')
    .trim()
    .optional(),
  name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(255, 'O nome não pode exceder 255 caracteres')
    .trim()
    .optional(),
  description: z.string().max(1000).trim().nullable().optional(),
  category: z.string().min(1).max(100).trim().optional(),
  required: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  allowedExtensions: z.string().max(255).trim().nullable().optional(),
});

export const documentTypeFilterSchema = z.object({
  search: z.string().max(255).trim().optional(),
  category: z.string().max(100).trim().optional(),
  isActive: z
    .preprocess((val) => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return undefined;
    }, z.boolean().optional())
    .optional(),
});

export type CreateDocumentTypeInput = z.infer<typeof createDocumentTypeSchema>;
export type UpdateDocumentTypeInput = z.infer<typeof updateDocumentTypeSchema>;
export type DocumentTypeFilterInput = z.infer<typeof documentTypeFilterSchema>;

