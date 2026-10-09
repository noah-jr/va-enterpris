export const queryKeys = {
  perfil: ['perfil'] as const,
  creditos: {
    all: ['creditos'] as const,
    list: (filters?: Record<string, unknown>) => ['creditos', 'list', filters] as const,
    detail: (id: number | string) => ['creditos', 'detail', String(id)] as const,
  },
  faturas: {
    all: ['faturas'] as const,
    list: (filters?: Record<string, unknown>) => ['faturas', 'list', filters] as const,
  },
  mensagens: {
    all: ['mensagens'] as const,
    list: ['mensagens', 'list'] as const,
  },
  notificacoes: {
    all: ['notificacoes'] as const,
  },
} as const
