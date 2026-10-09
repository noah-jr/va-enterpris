import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router'
import { Layout } from '../components/Layout'
import { ErrorLayout } from '../components/ErrorLayout'
import { LandingHome } from '../pages/LandingHome'
import { SolicitarPage } from '../pages/SolicitarPage'
import { TransparenciaPage } from '../pages/TransparenciaPage'
import { TermosPage } from '../pages/TermosPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ErrorPage } from '../pages/ErrorPage'

import { ThemeProvider } from '../context/ThemeContext'

function renderWithRouter(initialEntries = ['/']) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingHome />} />
            <Route path="solicitar" element={<SolicitarPage />} />
            <Route path="transparencia" element={<TransparenciaPage />} />
            <Route path="termos" element={<TermosPage />} />
          </Route>
          <Route
            path="erro"
            element={
              <ErrorLayout>
                <ErrorPage />
              </ErrorLayout>
            }
          />
          <Route
            path="*"
            element={
              <ErrorLayout>
                <NotFoundPage />
              </ErrorLayout>
            }
          />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  )
}

describe('Client-Side Routing Test Suite', () => {
  it('renders LandingHome on root path /', () => {
    renderWithRouter(['/'])
    expect(screen.getByTestId('landing-home')).toBeInTheDocument()
  })

  it('renders SolicitarPage on /solicitar', () => {
    renderWithRouter(['/solicitar'])
    expect(screen.getByTestId('solicitar-page')).toBeInTheDocument()
  })

  it('renders TransparenciaPage on /transparencia', () => {
    renderWithRouter(['/transparencia'])
    expect(screen.getByTestId('transparencia-page')).toBeInTheDocument()
  })

  it('renders TermosPage on /termos', () => {
    renderWithRouter(['/termos'])
    expect(screen.getByTestId('termos-page')).toBeInTheDocument()
  })

  it('renders ErrorPage in ErrorLayout on /erro', () => {
    renderWithRouter(['/erro'])
    expect(screen.getByTestId('error-layout')).toBeInTheDocument()
    expect(screen.getByTestId('error-page')).toBeInTheDocument()
  })

  it('renders NotFoundPage in ErrorLayout on unknown route', () => {
    renderWithRouter(['/rota-inexistente'])
    expect(screen.getByTestId('error-layout')).toBeInTheDocument()
    expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
  })
})
