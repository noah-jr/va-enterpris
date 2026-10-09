import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Clientes } from '../pages/Clientes'
import { ThemeProvider } from '../context/ThemeContext'

// Mock api call for clientes
vi.mock('../api/client', () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            nome: 'Empresa Comercial LDA',
            nif: '005432109LA032',
            email: 'contato@empresa.co.ao',
            telefone: '923111222',
            scoreCredito: 780,
            risco: 'BAIXO',
            createdAt: '2026-08-01T00:00:00.000Z'
          }
        ],
        meta: { lastPage: 1, total: 1 }
      }
    }),
    post: vi.fn().mockResolvedValue({ data: { success: true } })
  }
}))

describe('Admin Clientes Management Page Component', () => {
  it('renders client management header, KPIs and clients table', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Clientes />
        </ThemeProvider>
      </MemoryRouter>
    )

    expect(screen.getByText(/Gestão de Clientes & Mutuários/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Empresa Comercial LDA/i)).toBeInTheDocument()
      expect(screen.getByText(/005432109LA032/i)).toBeInTheDocument()
    })
  })

  it('opens registration modal when Registar Cliente button is clicked', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Clientes />
        </ThemeProvider>
      </MemoryRouter>
    )

    const newBtn = screen.getByRole('button', { name: /Registar Cliente/i })
    fireEvent.click(newBtn)

    expect(screen.getByText(/Novo Cliente \/ Mutuário/i)).toBeInTheDocument()
    expect(screen.getByText(/Nome Completo \/ Firma Social/i)).toBeInTheDocument()
  })
})
