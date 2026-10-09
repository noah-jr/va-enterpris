import { z } from 'zod';

export const createClientUploadSessionSchema = z.object({
  clientId: z.string().uuid({ message: 'ID de cliente inválido' }),
  month: z.coerce.number().int().min(1).max(12).optional().nullable(),
  year: z.coerce.number().int().min(2000).max(2100).optional().nullable(),
  label: z.string().max(255).optional().nullable(),
  expiresInDays: z.coerce.number().int().min(1).max(365).optional(),
});

export type CreateClientUploadSessionInput = z.infer<typeof createClientUploadSessionSchema>;

export const publicClientSessionUploadSchema = z.object({
  title: z.string().trim().min(1, 'O título é obrigatório').max(255).optional(),
  type: z.string().trim().min(1).max(100).default('OUTROS'),
  description: z.string().trim().max(1000).optional(),
});

export type PublicClientSessionUploadInput = z.infer<typeof publicClientSessionUploadSchema>;
