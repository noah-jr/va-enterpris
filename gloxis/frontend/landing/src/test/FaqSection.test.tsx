import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FaqSection } from '../components/FaqSection'

describe('FaqSection Component', () => {
  it('toggles FAQ accordion questions and answers', () => {
    render(<FaqSection />)

    // First question is open by default
    expect(screen.getByTestId('faq-answer-0')).toBeInTheDocument()

    // Click second question
    const q1Button = screen.getByTestId('faq-button-1')
    fireEvent.click(q1Button)

    expect(screen.getByTestId('faq-answer-1')).toBeInTheDocument()
  })

  it('renders support phone call button with correct tel link', () => {
    render(<FaqSection />)

    const callBtn = screen.getByTestId('faq-call-center-btn')
    expect(callBtn).toHaveAttribute('href', 'tel:+244222692000')
  })
})
