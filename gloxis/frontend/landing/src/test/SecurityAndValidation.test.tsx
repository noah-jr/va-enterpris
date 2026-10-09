import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SecurityAndValidation } from '../components/SecurityAndValidation'

describe('SecurityAndValidation Component', () => {
  it('renders phone report link and handles document code submission', () => {
    render(<SecurityAndValidation />)

    const reportLink = screen.getByTestId('link-reportar-fraude')
    expect(reportLink).toHaveAttribute('href', 'tel:+244222692000')

    const input = screen.getByTestId('input-doc-code')
    const submitBtn = screen.getByTestId('btn-validar-doc')

    fireEvent.change(input, { target: { value: 'GX-2026-99' } })
    fireEvent.click(submitBtn)

    expect(screen.getByTestId('doc-validation-result')).toHaveTextContent('GX-2026-99')
  })
})
