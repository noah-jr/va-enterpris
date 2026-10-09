import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router'
import { ProductsSection } from '../components/ProductsSection'

describe('ProductsSection Component', () => {
  it('renders category tabs and switches product lists when clicked', () => {
    render(
      <MemoryRouter>
        <ProductsSection />
      </MemoryRouter>
    )

    const creditoTab = screen.getByTestId('product-tab-credito')
    const contasTab = screen.getByTestId('product-tab-contas')

    expect(creditoTab).toBeInTheDocument()
    expect(contasTab).toBeInTheDocument()

    // Default tab: credito
    expect(screen.getByTestId('product-card-credito-pessoal')).toBeInTheDocument()

    // Click Contas tab
    fireEvent.click(contasTab)
    expect(screen.getByTestId('product-card-conta-ordem')).toBeInTheDocument()
    expect(screen.getByTestId('product-cta-conta-ordem')).toHaveAttribute('href', '/solicitar')
  })
})
