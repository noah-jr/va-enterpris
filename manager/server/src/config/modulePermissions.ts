
/**
 * Mapeamento centralizado de Módulos para as suas respetivas Permissões RBAC.
 * 
 * Este ficheiro serve como a "ponte" entre o Plano de Subscrição (Comercial)
 * e o Sistema de Permissões (Técnico).
 */
export const MODULE_PERMISSIONS: Record<string, string[]> = {
    dashboard: ['dashboard:view'],
    invoices: [
        'invoices:view', 'invoices:create', 'invoices:cancel', 'invoices:export', 
        'invoices:saft', 'fiscal:view'
    ],
    clients: ['clients:view', 'clients:create', 'clients:edit', 'clients:delete'],
    products: ['products:view', 'products:create', 'products:edit', 'products:delete', 'inventory:view'],
    services: ['services:view', 'services:create', 'services:edit', 'services:delete'],
    inventory: ['inventory:view', 'inventory:movements', 'inventory:adjustments'],
    suppliers: ['suppliers:view', 'suppliers:create', 'suppliers:edit', 'suppliers:delete'],
    reports: ['reports:view', 'reports:export', 'analytics:view'],
    hr: ['hr:view', 'employees:view', 'employees:create', 'employees:edit', 'employees:delete'],
    payroll: ['payroll:view', 'payroll:process', 'payroll:reports'],
    finance: ['finance:view', 'payments:view', 'payments:create', 'revenue:view'],
    accounting: ['accounting:view', 'ledger:view', 'tax:view'],
    treasury: ['treasury:view', 'cash:view', 'cash:movements'],
    fiscal: ['fiscal:view', 'saft:export', 'tax:reports'],
    projects: ['projects:view', 'projects:create', 'tasks:view'],
    training: ['academy:view', 'courses:view'],
    pos: ['pos:view', 'pos:sales', 'pos:close'],
    logistics: ['logistics:view', 'purchasing:view'],
    fleet: ['fleet:view', 'vehicles:view', 'maintenance:view'],
    hse: ['hse:view', 'safety:reports'],
    quality: ['quality:view', 'standards:view'],
    assets: ['assets:view', 'assets:maintenance'],
    production: ['production:view', 'mrp:view'],
    marketing: ['marketing:view', 'campaigns:view'],
    legal: ['legal:view', 'contracts:view'],
    budget: ['budget:view', 'opex:view'],
    strategy: ['strategy:view', 'planning:view'],
    kpis: ['kpis:view', 'performance:view'],
    documents: ['documents:view', 'documents:upload'],
    communications: ['communications:view', 'notifications:send'],
    calendar: ['calendar:view', 'agenda:manage'],
    approvals: ['approvals:view', 'approvals:manage'],
    settings: ['settings:view', 'company:edit', 'users:view', 'users:manage']
};

/**
 * Retorna todas as permissões associadas a uma lista de módulos.
 */
export const getPermissionsByModules = (modules: string[]): string[] => {
    const permissionsSet = new Set<string>();
    modules.forEach(mod => {
        const perms = MODULE_PERMISSIONS[mod] || [];
        perms.forEach(p => permissionsSet.add(p));
    });
    return Array.from(permissionsSet);
};
