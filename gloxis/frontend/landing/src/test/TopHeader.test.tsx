import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router'
import { TopHeader } from '../components/TopHeader'

function renderComponent() {
  return render(
    <MemoryRouter>
      <TopHeader />
    </MemoryRouter>
  )
}

describe('TopHeader Component', () => {
  it('renders segment buttons and handles click interactions', () => {
    renderComponent()

    const particularesBtn = screen.getByTestId('segment-particulares')
    const empresasBtn = screen.getByTestId('segment-empresas')

    expect(particularesBtn).toBeInTheDocument()
    expect(empresasBtn).toBeInTheDocument()

    // Test segment click
    fireEvent.click(empresasBtn)
    expect(empresasBtn).toHaveClass('text-white')
  })

  it('renders Linha de Apoio link with correct tel href', () => {
    renderComponent()

    const linhaLink = screen.getByTestId('link-linha24')
    expect(linhaLink).toBeInTheDocument()
    expect(linhaLink).toHaveAttribute('href', 'tel:+244222692000')
  })

  it('toggles language between PT and EN', () => {
    renderComponent()

    const langBtn = screen.getByTestId('btn-lang-toggle')
    expect(langBtn).toHaveTextContent('PT')

    fireEvent.click(langBtn)
    expect(langBtn).toHaveTextContent('EN')
  })
})
