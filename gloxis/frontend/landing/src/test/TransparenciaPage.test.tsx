import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router'
import { TransparenciaPage } from '../pages/TransparenciaPage'

describe('TransparenciaPage Component', () => {
  it('renders financial statistics and normative document downloads', async () => {
    render(
      <MemoryRouter>
        <TransparenciaPage />
      </MemoryRouter>
    )

    expect(screen.getByTestId('transparencia-page')).toBeInTheDocument()
    expect(screen.getByTestId('stats-grid')).toBeInTheDocument()
    expect(screen.getByTestId('normativos-list')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Volume de Microcrédito Concedido')).toBeInTheDocument()
      expect(screen.getByText('Aviso N.º 10/2024 BNA - Regulamento de Microcrédito')).toBeInTheDocument()
    })
  })
})
