import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'A mensagem não pode estar vazia')
    .max(10000, 'Mensagem demasiado longa')
    .trim(),
  isInternal: z.boolean().optional().default(false),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
