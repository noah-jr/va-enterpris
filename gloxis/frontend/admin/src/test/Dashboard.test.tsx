import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Dashboard } from '../pages/Dashboard'
import { ThemeProvider } from '../context/ThemeContext'

// Mock useDashboard hook
vi.mock('../hooks/useDashboard', () => ({
  useDashboard: () => ({
    kpis: {
      totalClientes: 45,
      clientesAtivos: 42,
      clientesNaListaNegra: 2,
      totalClientesInadimplentes: 1,
      taxaInadimplencia: 2.2,
      solicitacoesTotal: 60,
      solicitacoesAprovadas: 50,
      taxaAprovacao: 83.3,
      solicitacoesReprovadas: 5,
      solicitacoesPendentes: 5,
      totalDesembolsado: 12500000,
      totalRecebidoPagamentos: 4500000,
      totalJurosRecebidos: 1200000,
      saldoCarteiraTotalDevedor: 8000000,
      valorTotalAtrasado: 500000,
      history: []
    },
    loading: false,
    error: null,
    recentes: [
      {
        id: 1,
        cliente: { nome: 'Empresa Alfa S.A.', nif: '001234567LA01' },
        valor: 1500000,
        prazoMeses: 12,
        taxaJuro: 3.5,
        status: 'PENDENTE',
        createdAt: '2026-08-30T10:00:00.000Z'
      }
    ],
    vendas: [],
    diasFiltro: 30,
    setDiasFiltro: vi.fn(),
    handleExportPDF: vi.fn(),
    mainChartData: []
  })
}))

describe('Admin Dashboard Component', () => {
  it('renders KPI metrics cards and recent requests table', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Dashboard />
        </ThemeProvider>
      </MemoryRouter>
    )

    expect(screen.getByText(/Painel de Controlo/i)).toBeInTheDocument()
    expect(screen.getByText(/Total de Clientes/i)).toBeInTheDocument()
    expect(screen.getByText(/#1/i)).toBeInTheDocument()
  })
})
