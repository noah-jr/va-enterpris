import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Simulador } from '../pages/Simulador'

const mockSetValor = vi.fn()
const mockSetParcelas = vi.fn()
const mockHandleSimular = vi.fn((e) => e?.preventDefault())

vi.mock('../hooks/useSimulador', () => ({
  useSimulador: () => ({
    valor: 500000,
    setValor: mockSetValor,
    parcelas: 6,
    setParcelas: mockSetParcelas,
    resultado: {
      valorParcelaMensal: 95000,
      totalGeralPagar: 570000,
      totalJuros: 70000,
    },
    loading: false,
    handleSimular: mockHandleSimular,
  })
}))

describe('Client Credit Simulator Component', () => {
  it('renders credit simulator title and input controls', () => {
    render(
      <MemoryRouter>
        <Simulador />
      </MemoryRouter>
    )

    expect(screen.getByText(/Simulador de Crédito/i)).toBeInTheDocument()
    expect(screen.getByText(/Montante Solicitado \(Kz\)/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Simular Condições/i })).toBeInTheDocument()
  })

  it('renders estimated calculation results and application link', () => {
    render(
      <MemoryRouter>
        <Simulador />
      </MemoryRouter>
    )

    expect(screen.getByText(/Resultado Estimado/i)).toBeInTheDocument()
    expect(screen.getByText(/Prestação Mensal/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Solicitar Este Crédito/i })).toHaveAttribute('href', '/solicitar')
  })
})
