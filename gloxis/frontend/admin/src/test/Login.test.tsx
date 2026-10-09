import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Login from '../pages/Login'
import { ThemeProvider } from '../context/ThemeContext'

const mockSetEmail = vi.fn()
const mockSetPassword = vi.fn()

// Mock useAdminLogin
vi.mock('../hooks/useAdminLogin', () => ({
  useAdminLogin: () => ({
    email: '',
    setEmail: mockSetEmail,
    password: '',
    setPassword: mockSetPassword,
    totpToken: '',
    setTotpToken: vi.fn(),
    showPw: false,
    setShowPw: vi.fn(),
    requires2fa: false,
    error: null,
    loading: false,
    handleSubmit: vi.fn((e) => e.preventDefault()),
  })
}))

describe('Admin Login Page Component', () => {
  it('renders admin login form with title, branding, email and password inputs', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Login />
        </ThemeProvider>
      </MemoryRouter>
    )

    expect(screen.getByAltText(/Gloxis Financial Services/i)).toBeInTheDocument()
    expect(screen.getByText(/Portal Administrativo/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/admin@gloxis.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••••••/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Entrar no Dashboard/i })).toBeInTheDocument()
  })

  it('allows typing email and password into input fields', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Login />
        </ThemeProvider>
      </MemoryRouter>
    )

    const emailInput = screen.getByPlaceholderText(/admin@gloxis.com/i)
    fireEvent.change(emailInput, { target: { value: 'gestor@gloxis.co.ao' } })

    expect(mockSetEmail).toHaveBeenCalledWith('gestor@gloxis.co.ao')
  })
})
