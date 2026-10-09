import { BrowserRouter, Routes, Route } from 'react-router'
import { Layout } from './components/Layout'
import { ErrorLayout } from './components/ErrorLayout'
import { LandingHome } from './pages/LandingHome'
import { SolicitarPage } from './pages/SolicitarPage'
import { TransparenciaPage } from './pages/TransparenciaPage'
import { TermosPage } from './pages/TermosPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ErrorPage } from './pages/ErrorPage'

import { ThemeProvider } from './context/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
      <Routes>
        {/* Main Website Routes with Full Institutional Navbar/Footer */}
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingHome />} />
          <Route path="solicitar" element={<SolicitarPage />} />
          <Route path="transparencia" element={<TransparenciaPage />} />
          <Route path="termos" element={<TermosPage />} />
          <Route path="privacidade" element={<TermosPage />} />
        </Route>

        {/* Dedicated Error Layout Routes */}
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
    </BrowserRouter>
  </ThemeProvider>
  )
}
