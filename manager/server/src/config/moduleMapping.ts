
/**
 * Mapeamento de prefixos de rota (API) para Módulos do Sistema.
 * 
 * Este ficheiro garante que a segurança no servidor (Middleware) 
 * e a interface no cliente (Sidebar) utilizam a mesma lógica de permissões.
 */
export const MODULE_API_MAPPING: Record<string, string | string[]> = {
    // Cadastros & CRM
    'clients': ['clients', 'crm', 'cadastros', 'invoices'],
    'suppliers': ['inventory', 'suppliers', 'cadastros'],
    'products': ['inventory', 'products', 'cadastros', 'invoices'],
    'services': ['inventory', 'services', 'cadastros', 'products'],
    
    // Comercial & Facturação
    'invoices': ['finance', 'invoices', 'commercial'],
    'pos': ['pos', 'invoices'],
    'purchasing': ['inventory', 'purchasing'],
    'crm': ['crm', 'clients'],
    
    // Financeiro
    'finance': ['finance'],
    'treasury': ['finance', 'treasury'],
    'accounting': ['accounting', 'finance'],
    'accounting-cases': ['accounting', 'finance'],
    'budget': ['finance', 'budget', 'budgets'],
    'budgets': ['finance', 'budget', 'budgets'],
    'expenses': ['finance', 'expenses'],
    
    // Fiscal
    'fiscal': ['finance', 'fiscal', 'invoices'],
    'saft': ['finance', 'fiscal', 'invoices'],

    
    // RH
    'hr': ['hr', 'employees'],
    'employees': ['hr', 'employees'],
    'payroll': ['hr', 'payroll'],
    'payrolls': ['hr', 'payroll'],
    'recruitment': ['hr', 'recruitment'],
    'training': ['hr', 'training'],
    'academy': ['hr', 'training'],
    
    // Operações
    'logistics': ['logistics'],
    'fleet': ['logistics', 'fleet'],
    'production': ['production'],
    'assets': ['assets'],
    'maintenance': ['assets', 'maintenance'],
    
    // Estratégia
    'strategy': ['strategy'],
    'kpis': ['strategy', 'kpis'],
    'risks': ['strategy', 'risks'],
    'expansion': ['strategy', 'expansion'],
    'analytics': ['analytics', 'strategy'],
    
    // Compliance & Outros
    'hse': ['compliance', 'hse'],
    'quality': ['compliance', 'quality'],
    'legal': ['legal'],
    'documents': ['documents'],
    'communications': ['communications'],
    'calendar': ['hr', 'calendar'],
    'approvals': ['hr', 'approvals'],
    'dashboard': ['dashboard'],
    'reports': ['reports'],
    'settings': ['settings']
};
