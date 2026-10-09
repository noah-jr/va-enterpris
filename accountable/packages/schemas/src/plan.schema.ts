import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z.string().min(2, 'Nome demasiado curto').max(100, 'Nome demasiado longo').trim(),
  badge: z.string().max(100).trim().optional().nullable(),
  description: z.string().min(5, 'Descrição demasiado curta').max(2000, 'Descrição demasiado longa').trim(),
  priceMonthly: z.number().int().min(0).optional().nullable(),
  priceAnnual: z.number().int().min(0).optional().nullable(),
  currency: z.string().length(3).optional().default('AOA'),
  features: z.array(z.string().min(1).max(500)).min(1, 'Pelo menos uma funcionalidade é obrigatória'),
  ctaText: z.string().min(2).max(255).trim(),
  isPopular: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

export const updatePlanSchema = createPlanSchema.partial();

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
