import { z } from 'zod';
import { emailSchema, passwordSchema } from './auth.schema.js';

/**
 * Sem `password`, o utilizador recebe um convite por email (link + código) para
 * definir a própria senha — o administrador nunca precisa de a conhecer.
 */
export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Nome demasiado curto').max(255),
  email: emailSchema,
  password: passwordSchema.optional(),
  roleIds: z
    .array(z.string().uuid('ID de perfil inválido'))
    .min(1, 'Selecione pelo menos um perfil'),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2, 'Nome demasiado curto').max(255).optional(),
  isActive: z.boolean().optional(),
  roleIds: z.array(z.string().uuid()).min(1, 'Selecione pelo menos um perfil').optional(),
});

export const userFilterSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  perPage: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().trim().max(255).optional(),
});

export const roleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nome demasiado curto')
    .max(50)
    .regex(/^[A-Z0-9_]+$/, 'Use maiúsculas, números e underscore (ex.: GESTOR_FINANCEIRO)'),
  description: z.string().trim().max(500).optional().nullable(),
  permissions: z.array(z.string().regex(/^[a-z_]+:[a-z_]+$/)).min(1, 'Selecione pelo menos uma permissão'),
});

export const updateRoleSchema = roleSchema.partial();

// ============================================================
// Servidor de email
// ============================================================

export const emailSettingsSchema = z
  .object({
    provider: z.enum(['GMAIL', 'SMTP']),
    host: z.string().trim().min(1, 'Servidor obrigatório').max(255),
    port: z.coerce.number().int().min(1).max(65535),
    secure: z.boolean(),
    username: z.string().trim().max(255).optional().nullable(),
    /** Omitido/vazio = manter a senha atual. */
    password: z.string().max(512).optional().nullable(),
    fromName: z.string().trim().min(1, 'Nome do remetente obrigatório').max(255),
    fromEmail: emailSchema,
    isEnabled: z.boolean().default(true),
    otpEnabled: z.boolean().default(true),
    verificationExpiresHours: z.coerce.number().int().min(1).max(168).default(24),
    passwordResetExpiresMinutes: z.coerce.number().int().min(5).max(120).default(15),
  })
  .refine((d) => d.provider !== 'GMAIL' || Boolean(d.username), {
    message: 'O Gmail exige o endereço da conta como utilizador',
    path: ['username'],
  });

export const testEmailSchema = z.object({
  to: emailSchema,
  type: z.enum(['GENERIC', 'ACCOUNT_VERIFICATION', 'PASSWORD_RESET']).default('GENERIC'),
});

// ============================================================
// Subscrições (AOA)
// ============================================================

export const subscriptionStatusSchema = z.enum(['TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED']);
export const billingCycleSchema = z.enum(['MONTHLY', 'ANNUAL']);

export const createSubscriptionSchema = z.object({
  clientId: z.string().uuid('Cliente inválido'),
  planId: z.string().uuid('Plano inválido'),
  billingCycle: billingCycleSchema.default('MONTHLY'),
  status: z.enum(['TRIAL', 'ACTIVE']).default('ACTIVE'),
  startDate: z.string().datetime({ offset: true }).optional(),
  /** Obrigatório apenas para planos sem preço (ex.: Enterprise, sob proposta). Kwanzas inteiros. */
  customAmount: z.coerce.number().int().min(0).max(1_000_000_000).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export const updateSubscriptionSchema = z.object({
  status: subscriptionStatusSchema.optional(),
  planId: z.string().uuid().optional(),
  billingCycle: billingCycleSchema.optional(),
  customAmount: z.coerce.number().int().min(0).max(1_000_000_000).optional(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const subscriptionFilterSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  perPage: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: subscriptionStatusSchema.optional(),
  clientId: z.string().uuid().optional(),
});

export const clientFilterSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  perPage: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().max(255).trim().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const blockClientSchema = z.object({
  reason: z.string().min(5, 'Motivo obrigatório').max(500, 'Motivo demasiado longo').trim(),
});

export const auditFilterSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  perPage: z.coerce.number().int().min(1).max(100).optional().default(50),
  action: z.string().max(100).optional(),
  userId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  entity: z.string().max(100).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type RoleInput = z.infer<typeof roleSchema>;
export type EmailSettingsInput = z.infer<typeof emailSettingsSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ClientFilterInput = z.infer<typeof clientFilterSchema>;
export type BlockClientInput = z.infer<typeof blockClientSchema>;
export type AuditFilterInput = z.infer<typeof auditFilterSchema>;
