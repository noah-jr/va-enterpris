import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../api/client'
import { queryKeys } from '../../lib/queryKeys'
import type { Cliente } from '../useClienteDetalhes'
import type { KPI, SolicitacaoItem, VendaItem } from '../useDashboard'

// ─── QUERY HOOKS ──────────────────────────────────────────────────────────────

export function useClientesQuery(filters: { page: number; perPage: number; search: string; risco: string }) {
  return useQuery({
    queryKey: queryKeys.clientes.list(filters),
    queryFn: async () => {
      const res = await api.get('/clientes', {
        params: { page: filters.page, perPage: filters.perPage, search: filters.search, risco: filters.risco }
      })
      const payload = res.data
      const rawList: Record<string, unknown>[] = payload.data || payload

      const formatted = rawList.map(d => {
        let endStr = (d.endereco as string) || ''
        try {
          if (typeof d.endereco === 'string' && d.endereco.startsWith('{')) {
            const p = JSON.parse(d.endereco)
            endStr = [p.rua, p.numero, p.cidade, p.provincia].filter(Boolean).join(', ')
          }
        } catch { /* empty */ }

        let contaStr = (d.contaBancaria as string) || ''
        try {
          if (typeof d.contaBancaria === 'string' && d.contaBancaria.startsWith('{')) {
            const p = JSON.parse(d.contaBancaria)
            contaStr = [p.banco && `Banco: ${p.banco}`, p.agencia && `Agência: ${p.agencia}`, p.conta && `Conta: ${p.conta}`, p.iban && `IBAN: ${p.iban}`].filter(Boolean).join(' | ')
          }
        } catch { /* empty */ }

        return { ...d, endereco: endStr, contaBancaria: contaStr } as unknown as Cliente
      })

      return {
        data: formatted,
        meta: payload.meta ? {
          currentPage: payload.meta.currentPage as number,
          lastPage: payload.meta.lastPage as number,
          total: payload.meta.total as number,
        } : null
      }
    }
  })
}

export function useClienteDetailQuery(id: number | string | undefined) {
  return useQuery({
    queryKey: queryKeys.clientes.detail(id || 0),
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/clientes/${id}`)
      const payload = res.data.id !== undefined ? res.data : res.data.data

      let endStr = payload.endereco || ''
      try {
        if (typeof payload.endereco === 'string' && payload.endereco.startsWith('{')) {
          const p = JSON.parse(payload.endereco)
          endStr = [p.rua, p.numero, p.cidade, p.provincia].filter(Boolean).join(', ')
        }
      } catch { /* empty */ }

      const rawConta = payload.contaBancaria || payload.conta_bancaria || ''

      payload.endereco = endStr
      payload.contaBancaria = rawConta
      payload.email = payload.email || ''
      payload.telefone = payload.telefone || ''
      payload.scoreCredito = payload.scoreCredito ?? payload.score_credito ?? 0
      payload.isListaNegra = payload.isListaNegra ?? payload.is_lista_negra ?? false
      payload.risco = payload.risco || 'BAIXO'
      payload.fotografia = payload.fotografia || ''
      payload.logotipo = payload.logotipo || ''

      return payload as Cliente
    }
  })
}

export function useDashboardKPIsQuery(diasFiltro: number) {
  return useQuery({
    queryKey: queryKeys.kpis.dashboard(diasFiltro),
    queryFn: async () => {
      const [resKpi, resSol, resVendas] = await Promise.all([
        api.get(`/relatorios/kpis?dias=${diasFiltro}`),
        api.get('/solicitacoes?page=1&perPage=5'),
        api.get('/vendas?page=1&perPage=5')
      ])
      return {
        kpis: (resKpi.data.data || resKpi.data) as KPI,
        recentes: (resSol.data?.data || resSol.data || []) as SolicitacaoItem[],
        vendas: (resVendas.data?.data || resVendas.data || []) as VendaItem[],
      }
    }
  })
}

// ─── MUTATION HOOKS WITH AUTOMATIC CACHE INVALIDATION ────────────────────────

export function useCreateClienteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: FormData) => {
      const res = await api.post('/clientes', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes.all })
    }
  })
}

export function useUpdateClienteMutation(id: number | string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: FormData | Record<string, unknown>) => {
      const isFormData = payload instanceof FormData
      const res = await api.put(`/clientes/${id}`, payload, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes.all })
    }
  })
}

export function useCreateCreditoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { clienteId: number; valor: number; parcelas: number; finalidade: string }) => {
      const res = await api.post('/solicitacoes', data)
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.solicitacoes.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes.detail(variables.clienteId) })
    }
  })
}

export function useCreateFaturaMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { clienteId: number; valorTotal: number; descricao: string }) => {
      const res = await api.post('/faturacao', data)
      return res.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faturacao.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes.detail(variables.clienteId) })
    }
  })
}
