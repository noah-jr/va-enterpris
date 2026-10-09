import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router'
import { Navbar } from '../components/Navbar'

import { ThemeProvider } from '../context/ThemeContext'

function renderComponent() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </ThemeProvider>
  )
}

describe('Navbar Component', () => {
  it('renders brand logo and main CTA buttons with correct links', () => {
    renderComponent()

    const acessoBtn = screen.getByTestId('btn-acesso-cliente')
    const aderirBtn = screen.getByTestId('btn-aderir-ja')

    expect(acessoBtn).toHaveAttribute('href', 'http://localhost:5174')
    expect(aderirBtn).toHaveAttribute('href', '/solicitar')
  })

  it('opens and closes dropdown menus on mouse enter/leave', () => {
    renderComponent()

    const produtosBtn = screen.getByTestId('menu-produtos-btn')
    
    // Hover over Produtos
    fireEvent.mouseEnter(produtosBtn)
    expect(screen.getByTestId('dropdown-produtos')).toBeInTheDocument()

    // Mouse leave
    fireEvent.mouseLeave(produtosBtn)
    expect(screen.queryByTestId('dropdown-produtos')).not.toBeInTheDocument()
  })

  it('toggles search input box', () => {
    renderComponent()

    const searchToggle = screen.getByTestId('search-toggle-btn')
    fireEvent.click(searchToggle)

    const searchInput = screen.getByTestId('search-input')
    expect(searchInput).toBeInTheDocument()
  })

  it('toggles mobile navigation drawer', () => {
    renderComponent()

    const mobileToggle = screen.getByTestId('btn-mobile-toggle')
    fireEvent.click(mobileToggle)

    expect(screen.getByTestId('mobile-drawer')).toBeInTheDocument()
    expect(screen.getByTestId('mobile-btn-solicitar')).toHaveAttribute('href', '/solicitar')
  })
})
