
/**
 * Mapeamento de Rotas do Frontend para Chaves de Módulo.
 * 
 * Este ficheiro garante que a Proteção de Rota (ProtectedRoute) 
 * e o Menu (Sidebar) estão sincronizados.
 */
export const ROUTE_MODULE_MAPPING: Record<string, string> = {
    '/invoices': 'invoices',
    '/clients': 'clients',
    '/products': 'products',
    '/services': 'services',
    '/suppliers': 'inventory',
    '/inventory': 'inventory',
    '/pos': 'pos',
    '/purchasing': 'purchasing',
    '/crm-sales': 'crm',
    '/hr': 'hr',
    '/payroll': 'payroll',
    '/finance': 'finance',
    '/treasury': 'treasury',
    '/accounting': 'accounting',
    '/budget': 'budget',
    '/fiscal': 'invoices', // Fiscal summary depends on invoices
    '/saft': 'invoices',
    '/reports': 'reports',
    '/kpis': 'strategy',
    '/strategy': 'strategy',
    '/projects': 'projects',
    '/academy': 'training',
    '/training': 'training',
    '/logistics': 'logistics',
    '/production': 'production',
    '/fleet': 'fleet',
    '/maintenance': 'maintenance',
    '/assets': 'assets',
    '/marketing': 'marketing',
    '/legal': 'legal',
    '/compliance': 'compliance',
    '/hse': 'compliance',
    '/quality': 'compliance',
    '/documents': 'documents',
    '/communications': 'communications',
    '/risks': 'strategy',
    '/recruitment': 'hr',
    '/expansion': 'strategy',
    '/approvals': 'hr',
    '/calendar': 'hr'
};

/**
 * Verifica se o utilizador pode aceder a uma determinada rota baseada nos módulos ativos.
 */
export const canAccessRoute = (path: string, enabledModules: string[], role: string): boolean => {
    if (role?.toUpperCase() === 'SUPER_ADMIN') return true;
    
    // Rotas sempre permitidas (Dashboard, Perfil, etc)
    const publicPaths = ['/dashboard', '/subscription', '/settings', '/support', '/audit-logs', '/admin-users', '/roles'];
    if (publicPaths.includes(path)) return true;

    // Procura o módulo correspondente à rota
    const moduleKey = ROUTE_MODULE_MAPPING[path] || Object.entries(ROUTE_MODULE_MAPPING).find(([key]) => path.startsWith(key))?.[1];
    
    if (!moduleKey) return true; // Se não mapeado, assume livre ou protegido por RBAC genérico
    
    return enabledModules.includes(moduleKey);
};
