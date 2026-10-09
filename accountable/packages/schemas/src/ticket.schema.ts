import { z } from 'zod';
import { paginationSchema } from './document.schema.js';

export const createTicketSchema = z.object({
  subject: z.string().min(5, 'Assunto demasiado curto').max(255, 'Assunto demasiado longo').trim(),
  category: z.string().min(1, 'Categoria é obrigatória').max(100).trim(),
  description: z
    .string()
    .min(20, 'Descrição muito curta')
    .max(5000, 'Descrição demasiado longa')
    .trim(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional().default('NORMAL'),
});

export const sendTicketMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'A mensagem não pode estar vazia')
    .max(5000, 'Mensagem demasiado longa')
    .trim(),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'AWAITING_CLIENT', 'RESOLVED', 'CLOSED']),
});

export const ticketFilterSchema = paginationSchema.extend({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'AWAITING_CLIENT', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  clientId: z.string().uuid().optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type SendTicketMessageInput = z.infer<typeof sendTicketMessageSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type TicketFilterInput = z.infer<typeof ticketFilterSchema>;
