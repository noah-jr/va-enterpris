import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

describe('App Landing Page Integration & Links Test Suite', () => {
  it('renders full landing page structure with all key sections', () => {
    render(<App />)

    expect(screen.getByTestId('top-header')).toBeInTheDocument()
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('hero-slider')).toBeInTheDocument()
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument()
    expect(screen.getByTestId('products-section')).toBeInTheDocument()
    expect(screen.getByTestId('digital-app-showcase')).toBeInTheDocument()
    expect(screen.getByTestId('simulator-section')).toBeInTheDocument()
    expect(screen.getByTestId('security-section')).toBeInTheDocument()
    expect(screen.getByTestId('contact-section')).toBeInTheDocument()
    expect(screen.getByTestId('faq-section')).toBeInTheDocument()
    expect(screen.getByTestId('footer-section')).toBeInTheDocument()
  })

  it('validates that all primary CTA buttons and links have non-empty href attributes', () => {
    render(<App />)

    const allLinks = screen.getAllByRole('link')
    expect(allLinks.length).toBeGreaterThan(15)

    allLinks.forEach((link) => {
      const href = link.getAttribute('href')
      expect(href).not.toBeNull()
      expect(href).not.toBe('')
    })
  }, 15000)
})
