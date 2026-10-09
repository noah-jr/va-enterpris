export const queryKeys = {
  simulacao: {
    calcular: (valor: number, parcelas: number) => ['simulacao', valor, parcelas] as const,
  },
  contacto: {
    enviar: ['contacto', 'enviar'] as const,
  },
} as const
