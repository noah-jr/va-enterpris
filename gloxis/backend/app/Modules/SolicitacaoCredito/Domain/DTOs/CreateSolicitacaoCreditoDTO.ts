import { z } from 'zod'

/**
 * Validation schema for creating a credit request.
 * - clienteId: must be a positive integer.
 * - valor: positive number with up to two decimal places.
 * - parcelas: positive integer.
 */
export const CreateSolicitacaoCreditoDTO = z.object({
  clienteId: z.number().int().positive(),
  valor: z
    .number()
    .positive()
    .refine((v: number) => Number.isFinite(v) && Number(v.toFixed(2)) === v, {
      message: 'Valor must have at most two decimal places',
    }),
  parcelas: z.number().int().positive(),
})

export type CreateSolicitacaoCreditoInput = z.infer<typeof CreateSolicitacaoCreditoDTO>
