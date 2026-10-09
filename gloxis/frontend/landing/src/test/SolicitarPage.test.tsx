import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SolicitarPage } from '../pages/SolicitarPage'
import { httpService } from '../services/httpService'

// Mock httpService for unit testing the UI flow
vi.spyOn(httpService, 'get').mockImplementation(async (url: string) => {
  if (url === '/produtos') {
    return {
      status: 200,
      data: {
        data: [
          {
            id: 1,
            nome: 'Microcrédito Pessoal Direto',
            descricao: 'Financiamento individual para necessidades imediatas de tesouraria pessoal.',
            taxaJurosMensal: 0.035,
            prazoMinimoMeses: 3,
            prazoMaximoMeses: 36,
            valorMinimo: 100000,
            valorMaximo: 3000000,
            clausula: 'Contrato Regulamentado pelo BNA Aviso N.º 10/2024.',
          },
        ],
      },
    } as any
  }
  return { status: 200, data: { data: [] } } as any
})

vi.spyOn(httpService, 'post').mockImplementation(async (url: string) => {
  if (url === '/solicitacoes/public') {
    return {
      status: 201,
      data: {
        success: true,
        data: {
          id: 42,
          processNumber: 'GLX-2026-00042',
        },
      },
    } as any
  }
  return { status: 200, data: {} } as any
})

describe('SolicitarPage Component', () => {
  it('renders Step 1 with dynamic API products and navigates through wizard steps', async () => {
    render(<SolicitarPage />)

    expect(screen.getByTestId('solicitar-page')).toBeInTheDocument()

    // Wait for API products to load
    await waitFor(() => {
      expect(screen.getByTestId('step-1-container')).toBeInTheDocument()
      expect(screen.getByText(/Microcrédito Pessoal Direto/i)).toBeInTheDocument()
    })

    // Advance to Step 2
    const btnNext1 = screen.getByTestId('btn-next-step-1')
    fireEvent.click(btnNext1)

    // Check Step 2 rendered
    expect(screen.getByTestId('step-2-container')).toBeInTheDocument()

    // Fill Step 2 inputs
    fireEvent.change(screen.getByTestId('input-nome'), { target: { value: 'Manuel da Silva' } })
    fireEvent.change(screen.getByTestId('input-bi-nif'), { target: { value: '004891234LA042' } })
    fireEvent.change(screen.getByTestId('input-telemovel'), { target: { value: '+244923000111' } })
    fireEvent.change(screen.getByTestId('input-email'), { target: { value: 'manuel@gloxis.ao' } })

    // Advance to Step 3
    const btnNext2 = screen.getByTestId('btn-next-step-2')
    fireEvent.click(btnNext2)

    // Check Step 3 rendered with official clause from API
    await waitFor(() => {
      expect(screen.getByTestId('step-3-container')).toBeInTheDocument()
      expect(screen.getByText(/Contrato Regulamentado pelo BNA Aviso N.º 10\/2024/i)).toBeInTheDocument()
    })

    // Accept terms
    const checkboxTermos = screen.getByTestId('checkbox-termos')
    fireEvent.click(checkboxTermos)
    expect(checkboxTermos).toBeChecked()

    // Submit form
    const btnSubmit = screen.getByTestId('btn-submit-processo')
    fireEvent.click(btnSubmit)

    // Check Step 4 Success container and process number
    await waitFor(() => {
      expect(screen.getByTestId('success-container')).toBeInTheDocument()
      const procNumber = screen.getByTestId('process-number-display')
      expect(procNumber.textContent).toBe('GLX-2026-00042')
    })
  })
})
