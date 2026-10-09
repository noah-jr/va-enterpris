import { z } from 'zod';

export const createUploadLinkSchema = z.object({
  expiresInHours: z.coerce.number().int().min(1).max(720).optional(),
});

export type CreateUploadLinkInput = z.infer<typeof createUploadLinkSchema>;
