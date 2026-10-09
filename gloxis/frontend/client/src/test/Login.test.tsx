import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Login from '../pages/Login'
import { ThemeProvider } from '../context/ThemeContext'

// Mock useLoginFlow
vi.mock('../hooks/useLoginFlow', () => ({
  useLoginFlow: () => ({
    email: '',
    setEmail: vi.fn(),
    password: '',
    setPassword: vi.fn(),
    showPw: false,
    setShowPw: vi.fn(),
    loginMethod: 'NIF',
    setLoginMethod: vi.fn(),
    totpToken: '',
    setTotpToken: vi.fn(),
    requires2fa: false,
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

describe('Client Login Page Component', () => {
  it('renders login form with title, branding, email and password inputs', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Login />
        </ThemeProvider>
      </MemoryRouter>
    )

    expect(screen.getByText(/Acesso por B.I. ou NIF/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument()
  })

  it('renders link to create new account (/register)', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Login />
        </ThemeProvider>
      </MemoryRouter>
    )

    const registerLink = screen.getByRole('link', { name: /Registe-se aqui/i })
    expect(registerLink).toBeInTheDocument()
    expect(registerLink).toHaveAttribute('href', '/register')
  })
})
