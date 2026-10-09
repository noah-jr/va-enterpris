import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Layout } from '../components/Layout'
import { ThemeProvider } from '../context/ThemeContext'

// Mock admin context / hooks
vi.mock('../context/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  })
}))

describe('Admin Layout Component & Responsive Navigation', () => {
  it('renders branding logo, desktop sidebar links, and user profile', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </MemoryRouter>
    )

    expect(screen.getAllByAltText(/Gloxis/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Painel de Controlo/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Solicitações de Crédito/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Clientes/i).length).toBeGreaterThan(0)
  })

  it('opens mobile drawer menu when hamburger button is clicked', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Layout />
        </ThemeProvider>
      </MemoryRouter>
    )

    const menuBtn = screen.getByTitle(/Abrir Menu/i)
    expect(menuBtn).toBeInTheDocument()

    fireEvent.click(menuBtn)

    expect(screen.getAllByText(/Gloxis Enterprise/i).length).toBeGreaterThan(0)
  })
})
