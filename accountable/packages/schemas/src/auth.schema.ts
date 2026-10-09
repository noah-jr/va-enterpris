import { z } from 'zod';

// ============================================================
// Password rules — reutilizável em register, reset, change
// ============================================================
export const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .max(128, 'A senha não pode ter mais de 128 caracteres')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial');

export const emailSchema = z
  .string()
  .email('Email inválido')
  .max(255, 'Email demasiado longo')
  .toLowerCase();

export const nipSchema = z
  .string()
  .min(5, 'NIP inválido')
  .max(20, 'NIP inválido')
  .regex(/^[A-Za-z0-9-]+$/, 'NIP apenas pode conter letras, números e hífen');

/**
 * Tokens enviados por email: 64 hex (256 bits). UUIDs continuam aceites para
 * links enviados antes da mudança de formato.
 */
export const emailTokenSchema = z
  .string()
  .regex(
    /^(?:[0-9a-f]{64}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i,
    'Token inválido',
  );

// ============================================================
// Auth schemas
// ============================================================

export const registerClientSchema = z.object({
  nip: nipSchema,
  name: z.string().min(2, 'Nome demasiado curto').max(255, 'Nome demasiado longo').trim(),
  email: emailSchema,
});

/** Código OTP de 6 dígitos enviado por email (alternativa ao link). */
export const otpCodeSchema = z.string().trim().regex(/^\d{6}$/, 'O código deve ter 6 dígitos');

/** Verificação por link (token) OU por email + código OTP. */
export const verifyEmailSchema = z.union([
  z.object({ token: emailTokenSchema }),
  z.object({ email: emailSchema, code: otpCodeSchema }),
]);

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

export const setPasswordSchema = z
  .object({
    token: emailTokenSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha obrigatória'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/** Redefinição por link (token) OU por email + código OTP. */
export const resetPasswordSchema = z
  .object({
    token: emailTokenSchema.optional(),
    email: emailSchema.optional(),
    code: otpCodeSchema.optional(),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
  .refine((data) => Boolean(data.token) || (Boolean(data.email) && Boolean(data.code)), {
    message: 'Indique o link recebido ou o email e o código de 6 dígitos',
    path: ['code'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual obrigatória'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

// ============================================================
// Types inferred from schemas
// ============================================================
export type RegisterClientInput = z.infer<typeof registerClientSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
