import { z } from 'zod';
import { emailSchema } from './auth.schema.js';

export const submitContactSchema = z.object({
  name: z.string().min(2, 'Nome demasiado curto').max(255, 'Nome demasiado longo').trim(),
  email: emailSchema,
  company: z.string().max(255).trim().optional(),
  phone: z.string().max(30).trim().optional(),
  message: z.string().min(10, 'Mensagem demasiado curta').max(5000, 'Mensagem demasiado longa').trim(),
});

export const subscribeNewsletterSchema = z.object({
  email: emailSchema,
});

export type SubmitContactInput = z.infer<typeof submitContactSchema>;
export type SubscribeNewsletterInput = z.infer<typeof subscribeNewsletterSchema>;
