import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { SimulatorSection } from '../components/SimulatorSection'

vi.mock('../api', () => ({
  api: {
    post: vi.fn().mockResolvedValue({
      data: {
        valorParcelaMensal: 45000,
        totalGeralPagar: 540000,
        jurosTotalPagar: 40000
      }
    })
  }
}))

describe('SimulatorSection Component', () => {
  const mockProdutos = [
    {
      id: 1,
      nome: 'Crédito Pessoal Online',
      taxaJurosMensal: 2.5,
      valorMinimo: 100000,
      valorMaximo: 5000000,
      prazoMinimoMeses: 6,
      prazoMaximoMeses: 36,
    }
  ]

  it('updates sliders and calculates loan amortization when calculate button is clicked', async () => {
    render(
      <MemoryRouter>
        <SimulatorSection produtos={mockProdutos} />
      </MemoryRouter>
    )

    const calcularBtn = screen.getByTestId('btn-simular-calcular')
    expect(calcularBtn).toBeInTheDocument()

    // Click calculate button
    fireEvent.click(calcularBtn)

    await waitFor(() => {
      expect(screen.getByTestId('resultado-parcela')).toBeInTheDocument()
      expect(screen.getByTestId('btn-simulador-candidatar')).toHaveAttribute('href', '/solicitar')
    })
  })
})
