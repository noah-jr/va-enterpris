import { Routes, Route, Navigate } from 'react-router'
import { Layout } from './components/Layout'
import { Clientes } from './pages/Clientes'
import { ClienteDetalhes } from './pages/ClienteDetalhes'
import { Solicitacoes } from './pages/Solicitacoes'
import { SolicitacaoDetalhes } from './pages/SolicitacaoDetalhes'
import { Pagamentos } from './pages/Pagamentos'
import { Dashboard } from './pages/Dashboard'
import { Renegociacoes } from './pages/Renegociacoes'
import { ListaNegra } from './pages/ListaNegra'
import { Garantias } from './pages/Garantias'
import Login from './pages/Login'
import { useAuth } from './store/useAuth'
import { Relatorios } from './pages/Relatorios'
import { Vendas } from './pages/Vendas'
import { Compras } from './pages/Compras'
import { Stock } from './pages/Stock'
import { Faturacao } from './pages/Faturacao'
import { Financeiro } from './pages/Financeiro'
import { Contabilidade } from './pages/Contabilidade'
import { RecursosHumanos } from './pages/RecursosHumanos'
import { Contratos } from './pages/Contratos'
import { Projetos } from './pages/Projetos'
import { Ativos } from './pages/Ativos'
import { Documentos } from './pages/Documentos'
import { Administracao } from './pages/Administracao'
import { Transparencia } from './pages/Transparencia'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        
        {/* Core ERP Modules */}
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/:id" element={<ClienteDetalhes />} />
        <Route path="vendas" element={<Vendas />} />
        <Route path="compras" element={<Compras />} />
        <Route path="stock" element={<Stock />} />
        <Route path="faturacao" element={<Faturacao />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="contabilidade" element={<Contabilidade />} />
        <Route path="rh" element={<RecursosHumanos />} />
        <Route path="contratos" element={<Contratos />} />
        <Route path="projetos" element={<Projetos />} />
        <Route path="ativos" element={<Ativos />} />
        <Route path="documentos" element={<Documentos />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="transparencia" element={<Transparencia />} />
        <Route path="administracao" element={<Administracao />} />

        {/* Legacy / Sub-modules */}
        <Route path="solicitacoes" element={<Solicitacoes />} />
        <Route path="solicitacoes/:id" element={<SolicitacaoDetalhes />} />
        <Route path="renegociacoes" element={<Renegociacoes />} />
        <Route path="pagamentos" element={<Pagamentos />} />
        <Route path="lista-negra" element={<ListaNegra />} />
        <Route path="garantias" element={<Garantias />} />

        {/* Fallbacks */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
