import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import {
  LayoutDashboard, CreditCard, Calculator, FileText,
  Inbox, User, Receipt, HeadphonesIcon, LogOut, Menu, X, Bell, FolderOpen, Sun, Moon
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '../store/useAuth'
import { useTheme } from '../context/ThemeContext'
import { api } from '../api/client'
import type { MensagemInbox } from '../types'

export interface NavItem {
  section?: string
  to?: string
  label?: string
  icon?: LucideIcon
  badge?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { section: 'Principal' },
  { to: '/', label: 'Painel de Controlo', icon: LayoutDashboard },
  { to: '/creditos', label: 'Meus Créditos', icon: CreditCard },
  { to: '/solicitar', label: 'Solicitar Crédito', icon: FileText },
  { to: '/simular', label: 'Simulador', icon: Calculator },
  { section: 'Financeiro' },
  { to: '/contabilidade', label: 'Faturação', icon: Receipt },
  { to: '/documentos', label: 'Meus Documentos', icon: FolderOpen },
  { to: '/inbox', label: 'Mensagens', icon: Inbox, badge: true },
  { section: 'Suporte' },
  { to: '/consultoria', label: 'Consultoria', icon: HeadphonesIcon },
  { to: '/perfil', label: 'O Meu Perfil', icon: User },
]

export function ClientLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const initials = user?.fullName
    ? user.fullName.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
    : 'CL'

  const pageLabel = NAV_ITEMS.find(
    (i: NavItem) => !i.section && i.to && (i.to === location.pathname || (i.to !== '/' && location.pathname.startsWith(i.to)))
  )

  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    // 1. Fetch unread msgs normally on navigation
    api.get('/inbox/me')
      .then((res: { data?: { data?: MensagemInbox[] } | MensagemInbox[] }) => {
        const msgs = Array.isArray(res.data) ? res.data : (res.data?.data || [])
        setUnreadCount(msgs.filter((m: MensagemInbox) => !m.lida).length)
      })
      .catch(() => {})

    // 2. Conectar ao Stream em tempo real (SSE)
    const token = localStorage.getItem('token')
    if (!token) return

    const eventSource = new EventSource(api.getApiUrl(`/notificacoes/stream?token=${token}`))

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { type?: string; message?: string }
        if (data.type === 'PING' || data.type === 'CONNECTED') return

        // Show Toast
        setToastMessage(data.message || 'Nova notificação recebida!')
        setTimeout(() => setToastMessage(''), 5000)

        // Increment badge if it's an inbox message
        if (data.type === 'NOVA_MENSAGEM') {
          setUnreadCount(prev => prev + 1)
        }
      } catch {}
    }

    return () => {
      eventSource.close()
    }
  }, [location.pathname])

  const handleLogout = async () => {
    try { await api.post('/account/logout') } catch {}
    logout()
    navigate('/login')
  }

  const isActive = (to?: string) =>
    !to ? false : to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 rounded-xl">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Gloxis Financial Services" className="h-8 w-auto object-contain shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-white truncate tracking-tight">{user?.fullName || 'Conta Cliente'}</p>
              <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 truncate">Gloxis Financials</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {NAV_ITEMS.map((item: NavItem, i) =>
          item.section ? (
            <div key={i} className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1 mt-3">
              {item.section}
            </div>
          ) : (
            <NavLink key={item.to || i} item={item} />
          )
        )}
      </nav>

      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[10px] font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{user?.fullName || 'Cliente'}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">Empresa Mutuária</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-zinc-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
            title="Terminar Sessão"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  )

  const NavLink = ({ item }: { item: NavItem }) => {
    if (!item.to || !item.label || !item.icon) return null
    const Icon = item.icon
    const active = isActive(item.to)
    return (
      <Link
        to={item.to}
        onClick={() => setSidebarOpen(false)}
        className={`group flex items-center justify-between px-3 py-2 transition-all text-xs font-medium ${
          active
            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold shadow-xs'
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 ${active ? 'text-white dark:text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white'}`} />
          <span>{item.label}</span>
        </div>
        {item.badge && unreadCount > 0 && (
          <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    )
  }

  return (
    <div className="flex h-screen w-full bg-[#fafafa] dark:bg-zinc-950 overflow-hidden font-sans text-zinc-900 dark:text-zinc-100">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl shadow-xl animate-in fade-in">
          <Bell size={18} className="text-zinc-300 dark:text-zinc-700" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hidden md:flex md:flex-col justify-between shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute top-0 left-0 bottom-0 w-[260px] bg-white dark:bg-zinc-900 flex flex-col justify-between z-10 shadow-2xl">
            <div className="flex justify-end p-3 border-b border-zinc-100 dark:border-zinc-800">
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200">
                <X size={20} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-6 z-10 sticky top-0 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
              {pageLabel?.label || 'Portal do Cliente'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-amber-400" />}
            </button>

            <Link to="/inbox" className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg relative transition-colors">
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full" />}
            </Link>
            <Link to="/perfil" className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold shadow-xs hover:scale-105 transition-transform">
              {initials}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
