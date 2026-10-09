import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ClientLayout } from '../components/ClientLayout'
import { ThemeProvider } from '../context/ThemeContext'

// Mock useAuth
vi.mock('../store/useAuth', () => ({
  useAuth: () => ({
    user: { fullName: 'João Manuel', email: 'joao@exemplo.ao', role: 'CLIENTE' },
    logout: vi.fn(),
  })
}))

describe('Client Layout Component', () => {
  it('renders branding logo, user info and navigation links', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <ClientLayout />
        </ThemeProvider>
      </MemoryRouter>
    )

    expect(screen.getByAltText(/Gloxis Financial Services/i)).toBeInTheDocument()
    expect(screen.getAllByText(/João Manuel/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Painel de Controlo/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Meus Créditos/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Solicitar Crédito/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Simulador/i).length).toBeGreaterThan(0)
  })
})
