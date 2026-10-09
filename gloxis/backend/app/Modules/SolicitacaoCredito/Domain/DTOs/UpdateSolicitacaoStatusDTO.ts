import { z } from 'zod'

/**
 * Validation schema for updating the status of a credit request.
 * - id: identifier of the request.
 * - status: must be one of the allowed enum values.
 */
export const UpdateSolicitacaoStatusDTO = z.object({
  id: z.number().int().positive(),
  status: z.enum([
    'PENDENTE',
    'EM_ANALISE',
    'APROVADO',
    'APROVADA',
    'REJEITADO',
    'REJEITADA',
    'DESEMBOLSADO',
    'CANCELADO',
  ]),
  motivoRejeicao: z.string().optional(),
})

export type UpdateSolicitacaoStatusInput = z.infer<typeof UpdateSolicitacaoStatusDTO>
