import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import { ErrorLayout } from '../components/ErrorLayout'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ErrorPage } from '../pages/ErrorPage'

describe('ErrorLayout & Error Pages Unit Tests', () => {
  it('renders ErrorLayout with header branding and footer', () => {
    render(
      <MemoryRouter>
        <ErrorLayout>
          <div>Conteúdo de Teste de Erro</div>
        </ErrorLayout>
      </MemoryRouter>
    )

    expect(screen.getByTestId('error-layout')).toBeInTheDocument()
    expect(screen.getByTestId('error-layout-brand')).toBeInTheDocument()
    expect(screen.getByTestId('error-layout-home-link')).toHaveAttribute('href', '/')
    expect(screen.getByText('Conteúdo de Teste de Erro')).toBeInTheDocument()
  })

  it('renders NotFoundPage with 404 message and home button', () => {
    render(
      <MemoryRouter>
        <ErrorLayout>
          <NotFoundPage />
        </ErrorLayout>
      </MemoryRouter>
    )

    expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
    expect(screen.getByText(/Erro 404/i)).toBeInTheDocument()
    expect(screen.getByTestId('link-404-home')).toHaveAttribute('href', '/')
  })

  it('renders ErrorPage with 500 system anomaly message and handles retry handler', () => {
    const handleRetry = vi.fn()
    render(
      <MemoryRouter>
        <ErrorLayout>
          <ErrorPage message="Falha de ligação com a base de dados." onRetry={handleRetry} />
        </ErrorLayout>
      </MemoryRouter>
    )

    expect(screen.getByTestId('error-page')).toBeInTheDocument()
    expect(screen.getByText('Falha de ligação com a base de dados.')).toBeInTheDocument()

    const btnRetry = screen.getByTestId('btn-error-retry')
    fireEvent.click(btnRetry)
    expect(handleRetry).toHaveBeenCalledTimes(1)
  })
})
