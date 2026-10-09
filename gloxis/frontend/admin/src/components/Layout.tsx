import React, { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { 
  LayoutDashboard, Users, ShoppingCart, ShoppingBag, Package, 
  Receipt, DollarSign, Calculator, Briefcase, FileSignature, 
  FolderKanban, Server, FileText, BarChart3, Settings, LogOut,
  Search, Bell, ShieldCheck, CreditCard, Menu, X,
  Handshake, ShieldAlert, AlertOctagon, MoreHorizontal, User, Sun, Moon, EyeOff
} from 'lucide-react'
import { useAuth } from '../store/useAuth'
import { useTheme } from '../context/ThemeContext'

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

interface SidebarGroup {
  category: string
  items: { name: string; path: string; icon: React.ComponentType<{ className?: string }> }[]
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    category: 'Geral & Entidades',
    items: [
      { name: 'Painel de Controlo', path: '/', icon: LayoutDashboard },
      { name: 'Clientes', path: '/clientes', icon: Users },
    ]
  },
  {
    category: 'Core Microcrédito',
    items: [
      { name: 'Solicitações de Crédito', path: '/solicitacoes', icon: ShieldCheck },
      { name: 'Amortizações & Pagamentos', path: '/pagamentos', icon: CreditCard },
      { name: 'Refinanciamentos', path: '/renegociacoes', icon: Handshake },
      { name: 'Garantias Real & Colaterais', path: '/garantias', icon: ShieldAlert },
      { name: 'Lista Negra BNA', path: '/lista-negra', icon: AlertOctagon },
    ]
  },
  {
    category: 'Gestão Comercial',
    items: [
      { name: 'Vendas & POS', path: '/vendas', icon: ShoppingCart },
      { name: 'Compras & Suprimentos', path: '/compras', icon: ShoppingBag },
      { name: 'Stock & Armazéns', path: '/stock', icon: Package },
      { name: 'Faturação AGT', path: '/faturacao', icon: Receipt },
    ]
  },
  {
    category: 'Financeiro & Contabilidade',
    items: [
      { name: 'Operações Financeiras', path: '/financeiro', icon: DollarSign },
      { name: 'Contabilidade PGC', path: '/contabilidade', icon: Calculator },
    ]
  },
  {
    category: 'Recursos & Imobilizado',
    items: [
      { name: 'Recursos Humanos', path: '/rh', icon: Briefcase },
      { name: 'Contratos', path: '/contratos', icon: FileSignature },
      { name: 'Projetos', path: '/projetos', icon: FolderKanban },
      { name: 'Ativos Fixos', path: '/ativos', icon: Server },
    ]
  },
  {
    category: 'Sistema & Auditoria',
    items: [
      { name: 'Gestão Documental', path: '/documentos', icon: FileText },
      { name: 'Transparência BNA', path: '/transparencia', icon: ShieldCheck },
      { name: 'Relatórios & KPIs', path: '/relatorios', icon: BarChart3 },
      { name: 'Administração', path: '/administracao', icon: Settings },
    ]
  }
]

const ALL_SIDEBAR_ITEMS = SIDEBAR_GROUPS.flatMap(g => g.items)

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AD'

  const currentItem = ALL_SIDEBAR_ITEMS.find(i => 
    location.pathname === i.path || (i.path !== '/' && location.pathname.startsWith(i.path))
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Agency / Team Selector Card */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
          <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              <img src="/logo.png" alt="Gloxis Financial Services" className="h-8 w-auto object-contain shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate tracking-tight">Gloxis Enterprise</p>
                <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 truncate">Portal de Gestão</p>
              </div>
            </div>
            <MoreHorizontal className="w-4 h-4 text-zinc-400 cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-200 shrink-0" />
          </div>
        </div>

        {/* Navigation Links - Full Flex Height */}
        <nav className="flex-1 px-3.5 py-4 space-y-5 overflow-y-auto">
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.category} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                {group.category}
              </div>
              {group.items.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path))
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'group flex items-center justify-between px-3 py-2.5 transition-all duration-150 text-xs font-medium rounded-lg',
                      isActive
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <item.icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white dark:text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white')} />
                      <span className="truncate">{item.name}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom User Card */}
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[10px] font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{user?.fullName || 'Administrador'}</p>
              <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 truncate uppercase">{user?.role || 'GESTOR'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-zinc-400 hover:text-rose-600 transition-colors p-1.5 cursor-pointer shrink-0"
            title="Terminar Sessão"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen w-full bg-[#fafafa] dark:bg-zinc-950 overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors font-sans" data-testid="admin-layout">
      
      {/* Desktop Sidebar */}
      <aside className="w-72 border-r border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hidden lg:flex lg:flex-col shrink-0 h-screen sticky top-0 transition-colors">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-zinc-900/50 backdrop-blur-xs transition-opacity" 
            onClick={() => setMobileOpen(false)} 
          />
          <aside className="absolute top-0 left-0 bottom-0 w-80 bg-white dark:bg-zinc-900 flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex justify-between items-center p-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Gloxis Logo" className="h-7 w-auto object-contain" />
                <span className="font-bold text-xs">Gloxis Enterprise</span>
              </div>
              <button 
                onClick={() => setMobileOpen(false)} 
                className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <SidebarContent />
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        
        {/* Header */}
        <header className="h-16 border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 sticky top-0 shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
              title="Abrir Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white tracking-tight truncate">
              {currentItem?.name || 'Painel Principal'}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Input with ⌘ K badge (Desktop & Tablet) */}
            <div className="relative hidden md:flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-zinc-400" />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="w-48 lg:w-72 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 pl-9 pr-12 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-800 rounded-lg transition-all"
              />
              <span className="absolute right-2.5 px-1.5 py-0.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-[10px] font-semibold text-zinc-400 dark:text-zinc-300 rounded">
                ⌘ K
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              {/* Light / Dark Mode Toggle Button */}
              <button 
                onClick={toggleTheme}
                title={theme === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer rounded-lg flex items-center justify-center"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>

              <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors rounded-lg cursor-pointer hidden sm:block">
                <EyeOff className="w-4 h-4" />
              </button>

              <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors relative rounded-lg cursor-pointer">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              </button>
              
              <div className="relative ml-1 sm:ml-2">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer rounded-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold shadow-xs">
                    {initials}
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 shadow-xl py-1 text-xs text-zinc-800 dark:text-zinc-200 z-50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                      <p className="font-bold text-zinc-900 dark:text-white">{user?.fullName || 'Utilizador Gloxis'}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{user?.email || 'admin@gloxis.co.ao'}</p>
                    </div>

                    <button
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        {theme === 'light' ? <Moon className="w-4 h-4 text-zinc-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                        Modo {theme === 'light' ? 'Escuro' : 'Claro'}
                      </span>
                      <span className="text-[10px] font-mono uppercase bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded">
                        {theme}
                      </span>
                    </button>

                    <Link
                      to="/administracao"
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="w-4 h-4 text-zinc-400" /> Perfil & Conta
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left font-medium cursor-pointer border-t border-zinc-100 dark:border-zinc-800"
                    >
                      <LogOut className="w-4 h-4" /> Terminar Sessão
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Container with Responsive Padding */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
