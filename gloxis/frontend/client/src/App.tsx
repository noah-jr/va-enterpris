import { Routes, Route, Navigate } from 'react-router'
import { ClientLayout } from './components/ClientLayout'
import { Dashboard } from './pages/Dashboard'
import { Simulador } from './pages/Simulador'
import { SolicitarCredito } from './pages/SolicitarCredito'
import { MeusCreditos } from './pages/MeusCreditos'
import { Inbox } from './pages/Inbox'
import { Perfil } from './pages/Perfil'
import { Contabilidade } from './pages/Contabilidade'
import { Consultoria } from './pages/Consultoria'
import { Documentos } from './pages/Documentos'
import Login from './pages/Login'
import Register from './pages/Register'
import { useAuth } from './store/useAuth'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/registo" element={<Register />} />

      {/* Protected client area */}
      <Route path="/" element={<ProtectedRoute><ClientLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="creditos" element={<MeusCreditos />} />
        <Route path="solicitar" element={<SolicitarCredito />} />
        <Route path="simular" element={<Simulador />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="contabilidade" element={<Contabilidade />} />
        <Route path="documentos" element={<Documentos />} />
        <Route path="consultoria" element={<Consultoria />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
