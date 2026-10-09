import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router'
import { QuickActions } from '../components/QuickActions'

describe('QuickActions Component', () => {
  it('renders all quick action buttons with clean router links', () => {
    render(
      <MemoryRouter>
        <QuickActions />
      </MemoryRouter>
    )

    const aberturaConta = screen.getByTestId('quick-action-abertura-conta')
    const simulador = screen.getByTestId('quick-action-simulador-credito')
    const creditoExpress = screen.getByTestId('quick-action-credito-express')
    const cartaoMulticaixa = screen.getByTestId('quick-action-cartao-multicaixa')
    const kwik = screen.getByTestId('quick-action-servico-kwik')
    const validarDoc = screen.getByTestId('quick-action-validar-documentos')

    expect(aberturaConta).toHaveAttribute('href', '/solicitar')
    expect(simulador).toHaveAttribute('href', '/solicitar')
    expect(creditoExpress).toHaveAttribute('href', '/solicitar')
    expect(cartaoMulticaixa).toHaveAttribute('href', '/solicitar')
    expect(kwik).toHaveAttribute('href', '/solicitar')
    expect(validarDoc).toHaveAttribute('href', '/transparencia')
  })
})
