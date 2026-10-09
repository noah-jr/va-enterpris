import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router'
import { HeroSlider } from '../components/HeroSlider'

function renderComponent() {
  return render(
    <MemoryRouter>
      <HeroSlider />
    </MemoryRouter>
  )
}

describe('HeroSlider Component', () => {
  it('renders hero title and primary/secondary CTA links', () => {
    renderComponent()

    const title = screen.getByTestId('hero-title')
    expect(title).toBeInTheDocument()

    const primaryCta = screen.getByTestId('hero-cta-primary')
    const secondaryCta = screen.getByTestId('hero-cta-secondary')
    const cardSimularBtn = screen.getByTestId('hero-card-simular-btn')

    expect(primaryCta).toHaveAttribute('href', '/solicitar')
    expect(secondaryCta).toHaveAttribute('href', '/transparencia')
    expect(cardSimularBtn).toHaveAttribute('href', '/solicitar')
  })

  it('cycles slides on next/prev button clicks', () => {
    renderComponent()

    const nextBtn = screen.getByTestId('next-slide-btn')
    fireEvent.click(nextBtn)

    const title = screen.getByTestId('hero-title')
    expect(title).toHaveTextContent('Microcrédito Express PME & Startups')
  })
})
