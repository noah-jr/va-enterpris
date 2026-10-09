import { useLogout, useMe, usePermissions } from "../auth/useAuth";
import {
  Box, Briefcase, Building, Calculator, Calendar, Car, Compass, Crown,
  DollarSign, Factory, FileText, Fingerprint, Gavel, Globe, GraduationCap,
  Home, LogOut, Monitor, PieChart, Scale, Search, ShieldAlert, ShieldCheck,
  ShoppingCart, Target, Truck, Users, Wallet, Warehouse, Wrench,
  Package, Layers, Database, Megaphone, Settings, Activity, CheckCircle,
  Key, ShieldPlus, ClipboardList, ChevronDown, ChevronRight
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const Sidebar = ({ onClose, isCollapsed }: { onClose?: () => void; isCollapsed?: boolean }) => {
  const location = useLocation();
  const logout = useLogout();
  const { data: user } = useMe();
  const { hasAnyPermission, hasRole, hasModule, isLoading: permsLoading } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroupIndex, setExpandedGroupIndex] = useState<number | null>(null);
  const role = user?.role || 'USER';

  const enabledModules: string[] = user?.company?.enabledModules ?? (user as any)?.enabledModules ?? [];
  const isSuperAdmin = role?.toUpperCase() === 'SUPER_ADMIN';
  const hasActiveSubscription = (user as any)?.hasActiveSubscription;

  const canSeeModule = (moduleKey?: string) => {
    if (!moduleKey) return true;
    if (moduleKey === 'settings') return true;
    if (!hasActiveSubscription) return false;
    return hasModule(moduleKey);
  };

  const groups = [
    {
      label: 'Geral',
      items: [
        { icon: <Home size={16} />, label: 'Painel de controlo', path: '/dashboard', roles: ['ADMIN', 'MANAGER', 'USER'] },
        { icon: <Calendar size={16} />, label: 'Agenda & Calendário', path: '/calendar', roles: ['ADMIN', 'MANAGER', 'USER'], perms: ['hr:view'], moduleKey: 'hr' },
      ]
    },    {
      label: 'Base de dados',
      items: [
        { icon: <Users size={16} />, label: 'Clientes', path: '/clients', roles: ['ADMIN', 'MANAGER'], perms: ['clients:view'], moduleKey: 'clients' },
        { icon: <Package size={16} />, label: 'Fornecedores', path: '/suppliers', roles: ['ADMIN', 'MANAGER'], perms: ['suppliers:view'], moduleKey: 'inventory' },
        { icon: <Database size={16} />, label: 'Produtos', path: '/products', roles: ['ADMIN', 'MANAGER'], perms: ['products:view'], moduleKey: 'products' },
        { icon: <Layers size={16} />, label: 'Serviços', path: '/services', roles: ['ADMIN', 'MANAGER'], perms: ['services:view'], moduleKey: 'services' },
        { icon: <Fingerprint size={16} />, label: 'Utilizadores', path: '/admin-users', roles: ['ADMIN'], perms: ['settings:view'], moduleKey: 'settings' },
        { icon: <Crown size={16} />, label: 'A Minha Subscrição', path: '/my-subscription', roles: ['ADMIN'], perms: ['subscription:view'], moduleKey: 'settings' },
      ]
    },
    {
      label: 'Comercial',
      items: [
        { icon: <FileText size={16} />, label: 'Faturas', path: '/invoices', roles: ['ADMIN', 'MANAGER'], perms: ['invoices:view'], moduleKey: 'invoices' },
        { icon: <ShoppingCart size={16} />, label: 'Compras', path: '/purchasing', roles: ['ADMIN', 'MANAGER'], perms: ['purchasing:view'], moduleKey: 'purchasing' },
        { icon: <Monitor size={16} />, label: 'Ponto de venda', path: '/pos', roles: ['ADMIN', 'MANAGER', 'USER'], perms: ['pos:view'], moduleKey: 'pos' },
        { icon: <Target size={16} />, label: 'Vendas e CRM', path: '/crm-sales', roles: ['ADMIN', 'MANAGER'], perms: ['crm:view'], moduleKey: 'crm' },
        { icon: <Megaphone size={16} />, label: 'Marketing', path: '/marketing', roles: ['ADMIN', 'MANAGER'], perms: ['crm:view'], moduleKey: 'crm' },
      ]
    },
    {
      label: 'Financeiro',
      items: [
        { icon: <Wallet size={16} />, label: 'Tesouraria', path: '/treasury', roles: ['ADMIN', 'MANAGER'], perms: ['treasury:view'], moduleKey: 'treasury' },
        { icon: <DollarSign size={16} />, label: 'Pagamentos', path: '/finance', roles: ['ADMIN', 'MANAGER'], perms: ['finance:view'], moduleKey: 'finance' },
        { icon: <Calculator size={16} />, label: 'Contas correntes', path: '/accounting', roles: ['ADMIN', 'MANAGER'], perms: ['accounting:view'], moduleKey: 'accounting' },
        { icon: <Briefcase size={16} />, label: 'Portal Contabilístico', path: '/accounting-portal', roles: ['ADMIN', 'MANAGER', 'USER'], perms: ['accounting:view'], moduleKey: 'accounting' },
        { icon: <PieChart size={16} />, label: 'Orçamentos', path: '/budget', roles: ['ADMIN', 'MANAGER'], perms: ['budget:view'], moduleKey: 'budget' },
      ]
    },
    {
      label: 'Fiscal',
      items: [
        { icon: <ShieldCheck size={16} />, label: 'Exportação SAF-T', path: '/fiscal', roles: ['ADMIN', 'MANAGER'], perms: ['invoices:view'], moduleKey: 'invoices' },
        { icon: <Scale size={16} />, label: 'Documentação', path: '/documents', roles: ['ADMIN', 'MANAGER'], perms: ['documents:view'], moduleKey: 'documents' },
        { icon: <Gavel size={16} />, label: 'Conformidade', path: '/legal', roles: ['ADMIN', 'MANAGER'], perms: ['legal:view'], moduleKey: 'legal' },
      ]
    },
    {
      label: 'Análise',
      items: [
        { icon: <PieChart size={16} />, label: 'Relatórios', path: '/reports', roles: ['ADMIN', 'MANAGER'], perms: ['reports:view'], moduleKey: 'reports' },
        { icon: <Compass size={16} />, label: 'Desempenho', path: '/kpis', roles: ['ADMIN', 'MANAGER'], perms: ['strategy:view'], moduleKey: 'strategy' },
        { icon: <Globe size={16} />, label: 'Expansão Global', path: '/expansion', roles: ['ADMIN', 'MANAGER'], perms: ['strategy:view'], moduleKey: 'strategy' },
        { icon: <Target size={16} />, label: 'BI & Analítica', path: '/analytics', roles: ['ADMIN'], perms: ['strategy:view'], moduleKey: 'strategy' },
      ]
    },
    {
      label: 'RH & Pessoas',
      items: [
        { icon: <Users size={16} />, label: 'Colaboradores', path: '/hr', roles: ['ADMIN', 'MANAGER'], perms: ['hr:view'], moduleKey: 'hr' },
        { icon: <GraduationCap size={16} />, label: 'Recrutamento', path: '/recruitment', roles: ['ADMIN', 'MANAGER'], perms: ['hr:view'], moduleKey: 'hr' },
        { icon: <GraduationCap size={16} />, label: 'Formação (Academy)', path: '/academy', roles: ['ADMIN', 'MANAGER'], perms: ['hr:view'], moduleKey: 'hr' },
        { icon: <ShieldPlus size={16} />, label: 'RH Avançado', path: '/hr-advanced', roles: ['ADMIN'], perms: ['hr:view'], moduleKey: 'hr' },
      ]
    },
    {
      label: 'Compliance & Auditoria',
      items: [
        { icon: <Search size={16} />, label: 'Auditoria de Sistema', path: '/compliance', roles: ['ADMIN', 'MANAGER'], perms: ['legal:view'], moduleKey: 'legal' },
        { icon: <Activity size={16} />, label: 'HSE (Segurança)', path: '/hse', roles: ['ADMIN', 'MANAGER'], perms: ['legal:view'], moduleKey: 'legal' },
        { icon: <CheckCircle size={16} />, label: 'Qualidade & Normas', path: '/quality', roles: ['ADMIN', 'MANAGER'], perms: ['legal:view'], moduleKey: 'legal' },
        { icon: <ShieldAlert size={16} />, label: 'Gestão de Riscos', path: '/risks', roles: ['ADMIN', 'MANAGER'], perms: ['risks:view'], moduleKey: 'strategy' },
        { icon: <CheckCircle size={16} />, label: 'Aprovações', path: '/approvals', roles: ['ADMIN', 'MANAGER', 'USER'], perms: ['settings:view'], moduleKey: 'settings' },
      ]
    },
    {
      label: 'Suporte',
      items: [
        { icon: <ShieldAlert size={16} />, label: 'Tickets de Suporte', path: '/tickets', roles: ['ADMIN', 'MANAGER', 'USER'], perms: ['settings:view'], moduleKey: 'settings' },
      ]
    },
    {
      label: 'Operações',
      items: [
        { icon: <Factory size={16} />, label: 'Produção', path: '/production', roles: ['ADMIN', 'MANAGER'], perms: ['production:view'], moduleKey: 'production' },
        { icon: <Truck size={16} />, label: 'Logística', path: '/logistics', roles: ['ADMIN', 'MANAGER'], perms: ['logistics:view'], moduleKey: 'logistics' },
        { icon: <Wrench size={16} />, label: 'Manutenção', path: '/maintenance', roles: ['ADMIN', 'MANAGER'], perms: ['maintenance:view'], moduleKey: 'maintenance' },
        { icon: <Car size={16} />, label: 'Frota', path: '/fleet', roles: ['ADMIN', 'MANAGER'], perms: ['fleet:view'], moduleKey: 'fleet' },
        { icon: <Warehouse size={16} />, label: 'Stock & Inventário', path: '/inventory', roles: ['ADMIN', 'MANAGER'], perms: ['inventory:view'], moduleKey: 'inventory' },
        { icon: <Box size={16} />, label: 'Ativos & Património', path: '/assets', roles: ['ADMIN', 'MANAGER'], perms: ['fleet:view'], moduleKey: 'fleet' },
        { icon: <ClipboardList size={16} />, label: 'Projetos', path: '/projects', roles: ['ADMIN', 'MANAGER'], perms: ['projects:view'], moduleKey: 'projects' },
      ]
    },
    {
      label: 'Configurações',
      items: [
        { icon: <Key size={16} />, label: 'Permissões (Roles)', path: '/roles', roles: ['ADMIN'], perms: ['settings:view'], moduleKey: 'settings' },
        { icon: <FileText size={16} />, label: 'Logs de Auditoria', path: '/audit-logs', roles: ['ADMIN'], perms: ['settings:view'], moduleKey: 'settings' },
        { icon: <Settings size={16} />, label: 'Definições', path: '/settings', roles: ['ADMIN', 'MANAGER'], perms: ['settings:view'], moduleKey: 'settings' },
      ]
    }
  ];

  return (
    <aside className="bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] flex flex-col h-full overflow-hidden w-full">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[var(--border-color)] shrink-0 overflow-hidden">
        <Link to="/dashboard" className="flex items-center gap-2.5 w-full">
          {!isCollapsed && <img src="/logo_full.png" alt="VA ONEGEST" className="hidden md:block h-7 w-auto object-contain" />}
          <img src="/logo.png" alt="VA ONEGEST" className={`${isCollapsed ? 'block mx-auto' : 'block md:hidden'} h-7 w-auto object-contain`} />
        </Link>
      </div>

      {/* Search Minimalist */}
      {!isCollapsed && (
        <div className="px-4 py-2 mt-2">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[var(--radius-md)] pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--text-muted)]/60"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-2 no-scrollbar">
        {/* Skeleton enquanto as permissões carregam — evita flash de itens */}
        {permsLoading ? (
          <div className="space-y-3 px-2 animate-pulse">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-8 bg-[var(--bg-primary)] rounded-[var(--radius-md)] opacity-50" />
            ))}
          </div>
        ) : (
          <>
            {groups.map((group, gIdx) => {
              const visibleItems = group.items.filter(item => {
                if (!canSeeModule((item as any).moduleKey)) return false;
                if ((item as any).perms) {
                  if (!hasAnyPermission((item as any).perms)) return false;
                } else {
                  if (!item.roles.includes(role) && !hasRole(item.roles)) return false;
                }

                // Restrições dinâmicas para clientes SaaS (não-superadmin)
                if (!isSuperAdmin) {
                  // Ocultar páginas de subscrição
                  if (item.path === '/subscription') return false;
                  // Ocultar faturação e POS
                  if (item.path === '/invoices' || item.path === '/pos') return false;
                  // Base de dados: não terão nada exceto utilizadores (criar users)
                  if (item.path === '/clients' || item.path === '/suppliers' || item.path === '/products' || item.path === '/services') return false;
                  // Fiscal: sem acesso
                  if (item.path === '/fiscal' || item.path === '/documents' || item.path === '/legal') return false;
                  // Comercial: apenas CRM (ocultar compras e marketing)
                  if (item.path === '/purchasing' || item.path === '/marketing') return false;
                  // Compliance & Operações: ocultar
                  if (item.path === '/compliance' || item.path === '/quality' || item.path === '/risks') return false;
                  if (item.path === '/production' || item.path === '/logistics' || item.path === '/maintenance' || item.path === '/fleet' || item.path === '/inventory' || item.path === '/assets' || item.path === '/projects') return false;
                  // KPIs e Análise estratégica: ocultar
                  if (item.path === '/kpis' || item.path === '/expansion' || item.path === '/analytics') return false;
                }

                if (searchTerm) {
                  return item.label.toLowerCase().includes(searchTerm.toLowerCase());
                }
                return true;
              });

              if (visibleItems.length === 0) return null;

              const isExpanded = searchTerm ? true : expandedGroupIndex === gIdx;

              return (
                <div key={gIdx} className="space-y-1">
                  {!isCollapsed && (
                    <button
                      onClick={() => setExpandedGroupIndex(expandedGroupIndex === gIdx ? null : gIdx)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] group hover:bg-[var(--bg-primary)]/50 transition-all duration-200"
                    >
                      <span className="text-[12px] font-semibold text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">
                        {group.label}
                      </span>
                      <span className={`text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-all duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={12} strokeWidth={3} />
                      </span>
                    </button>
                  )}

                  {(isExpanded || isCollapsed) && (
                    <div className={`space-y-1 mt-1 ${isCollapsed ? '' : 'px-1 animate-dropdown'}`}>
                      {visibleItems.map((item) => {
                        const isActive =
                          location.pathname === item.path ||
                          (item.path !== '/' && location.pathname.startsWith(item.path));

                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            title={isCollapsed ? item.label : undefined}
                            className={`group/item relative flex items-center ${isCollapsed ? 'justify-center mx-1' : 'gap-3 px-3'} py-2 rounded-[var(--radius-md)] text-[14px] transition-all duration-200 ${
                              isActive
                                ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                            }`}
                          >
                            <span className={`flex-shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover/item:text-[var(--accent)]'} transition-colors`}>
                              {item.icon}
                            </span>

                            {!isCollapsed && (
                              <span className="truncate flex-1">{item.label}</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </nav>

      {/* Rodapé Minimalista */}
      <div className="px-3 py-4 border-t border-[var(--border-color)] shrink-0 bg-[var(--sidebar-bg)]">
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-3 py-1.5 mb-2">
            <div className={`w-1.5 h-1.5 rounded-full ${navigator.onLine ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
              {navigator.onLine ? 'Online' : 'Offline'}
            </span>
          </div>
        )}
        <button
          onClick={() => logout.mutate()}
          title={isCollapsed ? "Sair" : undefined}
          className={`group/logout flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2 w-full rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:text-[var(--error)] hover:bg-[var(--bg-primary)] transition-all duration-200`}
        >
          <LogOut size={14} className="shrink-0" />
          {!isCollapsed && <span>Sair do sistema</span>}
        </button>
      </div>
    </aside>
  );
};

export { Sidebar };