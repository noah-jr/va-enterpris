export const queryKeys = {
  clientes: {
    all: ['clientes'] as const,
    list: (filters: { page?: number; perPage?: number; search?: string; risco?: string }) => 
      ['clientes', 'list', filters] as const,
    detail: (id: number | string) => ['clientes', 'detail', String(id)] as const,
    kpis: ['clientes', 'kpis'] as const,
  },
  kpis: {
    dashboard: (dias: number) => ['kpis', 'dashboard', dias] as const,
  },
  solicitacoes: {
    all: ['solicitacoes'] as const,
    list: (filters?: { page?: number; perPage?: number; status?: string }) => 
      ['solicitacoes', 'list', filters] as const,
    detail: (id: number | string) => ['solicitacoes', 'detail', String(id)] as const,
    parcelas: (solicitacaoId: number | string) => ['solicitacoes', solicitacaoId, 'parcelas'] as const,
  },
  vendas: {
    all: ['vendas'] as const,
    list: (filters?: { page?: number; perPage?: number }) => ['vendas', 'list', filters] as const,
  },
  faturacao: {
    all: ['faturacao'] as const,
    list: (filters?: Record<string, unknown>) => ['faturacao', 'list', filters] as const,
  },
} as const
