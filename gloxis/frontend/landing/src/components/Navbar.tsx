import { useState } from 'react'
import { Link } from 'react-router'
import { 
  ChevronDown, Search, Menu, X, CreditCard, Wallet, 
  Briefcase, Landmark, Smartphone, FileCheck, 
  UserCheck, ArrowRight, Sun, Moon 
} from 'lucide-react'

import { CLIENT_PORTAL_URL } from '../config/env'
import { useTheme } from '../context/ThemeContext'

export function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const bigProdutosMenu = [
    {
      title: 'Apoios ao Cidadão',
      icon: Landmark,
      items: [
        { name: 'Microcrédito Pessoal Direto', desc: 'Financiamento desmaterializado até Kz 10.000.000,00', href: '/solicitar' },
        { name: 'Conta Simplificada BNA', desc: 'Inclusão bancária imediata com B.I.', href: '/solicitar' },
        { name: 'Apoio à Habitação & Obras', desc: 'Crédito bonificado para habitação própria', href: '/solicitar' },
        { name: 'Subsídio ao Pensionista', desc: 'Condições especiais para reformados', href: '/solicitar' }
      ]
    },
    {
      title: 'Apoio a Empresas & PMEs',
      icon: Briefcase,
      items: [
        { name: 'Microcrédito Express PME', desc: 'Fundo de maneio e reforço de equipamento', href: '/solicitar' },
        { name: 'Linha Mulher Empreendedora', desc: 'Incentivo ao empreendedorismo feminino', href: '/solicitar' },
        { name: 'Garantias Estatais PME', desc: 'Apoio à obtenção de crédito bancário', href: '/transparencia' },
        { name: 'Financiamento de Stock Local', desc: 'Dinamização do setor produtivo', href: '/solicitar' }
      ]
    },
    {
      title: 'Cartões & Pagamentos',
      icon: CreditCard,
      items: [
        { name: 'Cartão Multicaixa do Cidadão', desc: 'Cartão oficial EMIS para compras e TPA', href: '/solicitar' },
        { name: 'Cartão Frota Institucional', desc: 'Gestão de combustível e viaturas', href: '/solicitar' },
        { name: 'Cartão Kamba de Viagens', desc: 'Pagamentos internacionais autorizados', href: '/solicitar' },
        { name: 'Rede Estatal Kwik', desc: 'Transferências imediatas interbancárias', href: '/solicitar' }
      ]
    },
    {
      title: 'Aforro & Proteção',
      icon: Wallet,
      items: [
        { name: 'Depósito Tesouro Direto', desc: 'Taxa fixa bonificada pelo Estado', href: '/solicitar' },
        { name: 'Poupança Jovem & Estudo', desc: 'Constituição de fundo para o futuro', href: '/solicitar' },
        { name: 'Seguro Multirriscos Social', desc: 'Proteção de edifícios e habitações', href: '/solicitar' },
        { name: 'Seguro de Vida & Invalidez', desc: 'Amparo financeiro às famílias', href: '/transparencia' }
      ]
    }
  ]

  const servicosMenu = [
    { name: 'Balcão Digital do Cidadão', desc: 'Acompanhamento de processos 24/7.', icon: Smartphone, href: CLIENT_PORTAL_URL },
    { name: 'Abertura de Candidatura', desc: 'Submeta o seu processo online com B.I.', icon: UserCheck, href: '/solicitar' },
    { name: 'Sistema Kwik Estatal', desc: 'Pagamento de taxas e transferências.', icon: Wallet, href: '/solicitar' },
    { name: 'Validação de Chancela', desc: 'Verificação jurídica de certidões.', icon: FileCheck, href: '/transparencia' },
  ]

  return (
    <nav className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-200/80 dark:border-zinc-800 shadow-xs transition-colors" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 py-1" data-testid="brand-logo">
            <img 
              src="/logo.png" 
              alt="Gloxis Financial Services" 
              className="h-9 w-auto object-contain" 
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            
            {/* Mega Menu - Produtos & Apoios */}
            <div 
              className="static"
              onMouseEnter={() => setActiveMenu('produtos')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button 
                data-testid="menu-produtos-btn"
                className={`flex items-center gap-1 px-3 py-5 transition-colors cursor-pointer rounded ${
                  activeMenu === 'produtos' ? 'text-zinc-900 dark:text-white font-bold bg-zinc-100/80 dark:bg-zinc-800' : 'hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span>Programas & Apoios</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === 'produtos' ? 'rotate-180 text-zinc-900 dark:text-white' : 'text-zinc-400'}`} />
              </button>

              {/* Full-Width Mega Menu Dropdown */}
              {activeMenu === 'produtos' && (
                <div 
                  data-testid="dropdown-produtos"
                  className="absolute top-full left-0 right-0 w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-xl p-8 z-50 text-normal normal-case animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
                    
                    {/* 4 Categorized Columns */}
                    <div className="col-span-9 grid grid-cols-2 lg:grid-cols-4 gap-6 border-r border-zinc-100 dark:border-zinc-800 pr-8">
                      {bigProdutosMenu.map((group) => {
                        const IconComponent = group.icon
                        return (
                          <div key={group.title} className="space-y-3">
                            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xs pb-2 border-b border-zinc-100 dark:border-zinc-800 uppercase tracking-wider">
                              <IconComponent className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                              <span>{group.title}</span>
                            </div>
                            <ul className="space-y-2">
                              {group.items.map((item) => (
                                <li key={item.name}>
                                  <Link 
                                    to={item.href} 
                                    data-testid={`submenu-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="group block p-2 rounded hover:bg-zinc-100/80 dark:hover:bg-zinc-800 transition-all"
                                  >
                                    <p className="font-semibold text-xs text-zinc-900 dark:text-white group-hover:text-zinc-950 dark:group-hover:text-white leading-tight">
                                      {item.name}
                                    </p>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5 font-normal">
                                      {item.desc}
                                    </p>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      })}
                    </div>

                    {/* Side Highlight Box */}
                    <div className="col-span-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 p-5 rounded space-y-3 flex flex-col justify-between">
                      <div>
                        <span className="inline-block bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2">
                          Balcão Digital
                        </span>
                        <h4 className="font-bold text-zinc-900 dark:text-white text-sm mb-1">
                          Submeta a sua candidatura online
                        </h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                          Instrua o seu processo com o Bilhete de Identidade e obtenha resposta imediata.
                        </p>
                      </div>

                      <Link
                        to="/solicitar"
                        className="w-full bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Iniciar Processo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown - Serviços Públicos */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveMenu('servicos')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button 
                data-testid="menu-servicos-btn"
                className={`flex items-center gap-1 px-3 py-5 transition-colors cursor-pointer rounded ${
                  activeMenu === 'servicos' ? 'text-zinc-900 dark:text-white font-bold bg-zinc-100/80 dark:bg-zinc-800' : 'hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span>Serviços Públicos</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === 'servicos' ? 'rotate-180 text-zinc-900 dark:text-white' : 'text-zinc-400'}`} />
              </button>

              {activeMenu === 'servicos' && (
                <div 
                  data-testid="dropdown-servicos"
                  className="absolute top-full left-0 w-[480px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-b-md p-4 grid grid-cols-2 gap-2 text-normal normal-case animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  {servicosMenu.map((s) => {
                    const IconComp = s.icon
                    const isExternal = s.href.startsWith('http')
                    return isExternal ? (
                      <a 
                        key={s.name} 
                        href={s.href}
                        data-testid={`servico-item-${s.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="p-2.5 rounded hover:bg-zinc-100/80 dark:hover:bg-zinc-800 transition-all flex items-start gap-3"
                      >
                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded border border-zinc-200 dark:border-zinc-700 shrink-0">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-zinc-900 dark:text-white">{s.name}</p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">{s.desc}</p>
                        </div>
                      </a>
                    ) : (
                      <Link 
                        key={s.name} 
                        to={s.href}
                        data-testid={`servico-item-${s.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="p-2.5 rounded hover:bg-zinc-100/80 dark:hover:bg-zinc-800 transition-all flex items-start gap-3"
                      >
                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded border border-zinc-200 dark:border-zinc-700 shrink-0">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-zinc-900 dark:text-white">{s.name}</p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">{s.desc}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            <Link 
              to="/solicitar" 
              data-testid="nav-simulador-link"
              className="px-3 py-5 hover:text-zinc-900 dark:hover:text-white transition-colors rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              Simulador
            </Link>

            <Link 
              to="/transparencia" 
              data-testid="nav-apoio-link"
              className="px-3 py-5 hover:text-zinc-900 dark:hover:text-white transition-colors rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              Atendimento ao Cidadão
            </Link>

            <Link 
              to="/transparencia" 
              data-testid="nav-seguranca-link"
              className="px-3 py-5 hover:text-zinc-900 dark:hover:text-white transition-colors rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              Chancela Digital
            </Link>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Sun / Moon Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Mudar para Modo Escuro' : 'Mudar para Modo Claro'}
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors flex items-center justify-center cursor-pointer"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Search Trigger Button */}
          <div className="relative">
            <button 
              onClick={() => setSearchOpen(!searchOpen)} 
              data-testid="search-toggle-btn"
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors hidden sm:flex items-center justify-center cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            {searchOpen && (
              <div data-testid="search-input-box" className="absolute right-0 top-11 w-72 bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-md flex items-center gap-2">
                <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Pesquisar serviço ou processo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="search-input"
                  className="w-full text-xs outline-none text-zinc-800 dark:text-zinc-200 font-medium bg-transparent"
                  autoFocus
                />
              </div>
            )}
          </div>

          <a 
            href={CLIENT_PORTAL_URL} 
            data-testid="btn-acesso-cliente"
            className="hidden sm:inline-flex text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 px-3.5 py-1.5 rounded transition-all"
          >
            Portal do Cidadão
          </a>

          <Link 
            to="/solicitar" 
            data-testid="btn-aderir-ja"
            className="bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold px-4 py-1.5 rounded shadow-xs hover:shadow transition-all"
          >
            Submeter Processo
          </Link>

          {/* Mobile drawer toggle */}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="btn-mobile-toggle"
            className="lg:hidden p-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div data-testid="mobile-drawer" className="lg:hidden bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-6 py-5 space-y-3 animate-in fade-in">
          <Link to="/solicitar" onClick={() => setMobileOpen(false)} data-testid="mobile-link-produtos" className="block text-xs font-semibold text-zinc-900 dark:text-white py-2 border-b border-zinc-100 dark:border-zinc-800">
            Programas & Apoios
          </Link>
          <Link to="/solicitar" onClick={() => setMobileOpen(false)} data-testid="mobile-link-simulador" className="block text-xs font-semibold text-zinc-900 dark:text-white py-2 border-b border-zinc-100 dark:border-zinc-800">
            Simulador
          </Link>
          <a href={CLIENT_PORTAL_URL} onClick={() => setMobileOpen(false)} data-testid="mobile-link-vantagens" className="block text-xs font-semibold text-zinc-900 dark:text-white py-2 border-b border-zinc-100 dark:border-zinc-800">
            Balcão Digital
          </a>
          <Link to="/transparencia" onClick={() => setMobileOpen(false)} data-testid="mobile-link-faq" className="block text-xs font-semibold text-zinc-900 dark:text-white py-2 border-b border-zinc-100 dark:border-zinc-800">
            Atendimento ao Cidadão
          </Link>
          <Link to="/transparencia" onClick={() => setMobileOpen(false)} data-testid="mobile-link-seguranca" className="block text-xs font-semibold text-zinc-900 dark:text-white py-2 border-b border-zinc-100 dark:border-zinc-800">
            Chancela Digital
          </Link>
          <div className="pt-3 flex flex-col gap-2">
            <a href={CLIENT_PORTAL_URL} onClick={() => setMobileOpen(false)} data-testid="mobile-btn-acesso" className="w-full text-center border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-semibold text-xs py-2 rounded">
              Portal do Cidadão
            </a>
            <Link to="/solicitar" onClick={() => setMobileOpen(false)} data-testid="mobile-btn-solicitar" className="w-full text-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs py-2 rounded">
              Submeter Candidatura
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
