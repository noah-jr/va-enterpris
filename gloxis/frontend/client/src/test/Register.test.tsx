import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Register from '../pages/Register'
import { ThemeProvider } from '../context/ThemeContext'

// Mock useLoginFlow
vi.mock('../hooks/useLoginFlow', () => ({
  useLoginFlow: () => ({
    email: '',
    setEmail: vi.fn(),
    password: '',
    setPassword: vi.fn(),
    nif: '',
    setNif: vi.fn(),
    fullName: '',
    setFullName: vi.fn(),
    phone: '',
    setPhone: vi.fn(),
    error: null,
    loading: false,
    handleSubmit: vi.fn((e) => e.preventDefault()),
  })
}))

describe('Client Register Page Component', () => {
  it('renders registration form with required fields (Nome, NIF, Email, Telemóvel, Password)', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Register />
        </ThemeProvider>
      </MemoryRouter>
    )

    expect(screen.getByText(/Registo de Conta de Cliente/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Nome Completo do Titular/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/004891234LA042/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/exemplo@email.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/923000000/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Concluir Registo de Cliente/i })).toBeInTheDocument()
  })

  it('renders link to login page (/login)', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Register />
        </ThemeProvider>
      </MemoryRouter>
    )

    const loginLinks = screen.getAllByRole('link', { name: /Iniciar Sessão/i })
    expect(loginLinks.length).toBeGreaterThan(0)
    expect(loginLinks[0]).toHaveAttribute('href', '/login')
  })
})
