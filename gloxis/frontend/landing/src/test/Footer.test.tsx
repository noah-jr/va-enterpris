import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router'
import { Footer } from '../components/Footer'

describe('Footer Component', () => {
  it('renders institutional footer links and contacts', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    expect(screen.getByTestId('footer-phone-link')).toHaveAttribute('href', 'tel:+244222692000')
    expect(screen.getByTestId('footer-email-link')).toHaveAttribute('href', 'mailto:apoio@gloxis.gov.ao')
    expect(screen.getByTestId('footer-link-portal')).toHaveAttribute('href', 'http://localhost:5174')
  })
})
