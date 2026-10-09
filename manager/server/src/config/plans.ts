
export const PLANS = {
    BASIC_DAILY: {
        id: 'BASIC_DAILY',
        name: 'Básico Diário',
        subtitle: 'Geração de facturas diárias',
        price: 2500,
        annualPrice: 2500 * 365,
        maxUsers: 1,
        color: '#10b981',
        features: [
            'Facturação Rápida',
            'Gestão de Clientes',
            'Dashboard Básico'
        ],
        modules: [
            'dashboard', 'invoices', 'clients', 'settings'
        ],
    },
    STARTER: {
        id: 'STARTER',
        name: 'Starter / Launchpad',
        subtitle: 'Ideal para PMEs e startups em fase inicial',
        price: 45000,
        annualPrice: 450000,
        maxUsers: 5,
        color: '#6366f1',
        features: [
            'Faturação ilimitada (AGT)',
            'Gestão de 500 Clientes',
            'Relatórios Mensais de Vendas',
            '5 Utilizadores Admin',
            'Suporte por email',
        ],
        modules: [
            'dashboard', 'invoices', 'clients', 'products', 'inventory', 'services', 'suppliers', 'reports', 'settings', 'calendar', 'approvals'
        ],
    },
    PROFESSIONAL: {
        id: 'PROFESSIONAL',
        name: 'Professional / Market Leader',
        subtitle: 'Para empresas em expansão estruturada',
        price: 120000,
        annualPrice: 1200000,
        maxUsers: 25,
        color: '#0ea5e9',
        popular: true,
        features: [
            'Tudo do Starter +',
            'RH & Folha de Salários',
            'CRM & Pipeline de Vendas',
            'Tesouraria & Finanças',
            'Projectos & Tarefas',
            'Suporte prioritário 8x5',
        ],
        modules: [
            'dashboard', 'invoices', 'clients', 'products', 'services', 'suppliers',
            'reports', 'settings', 'hr', 'payroll', 'purchasing', 'crm', 'finance', 
            'accounting', 'treasury', 'fiscal', 'budget', 'projects', 'training', 'communications', 'pos', 'expenses'
        ],
    },
    ENTERPRISE: {
        id: 'ENTERPRISE',
        name: 'Enterprise / Infinite Global',
        subtitle: 'Controlo total para grandes organizações',
        price: 350000,
        annualPrice: 3500000,
        maxUsers: 999,
        color: '#f59e0b',
        features: [
            'Ecossistema Completo VA',
            'BI & Analytics avançados',
            'Logística, Frota & Produção',
            'HSE & Compliance',
            'Gestão de Activos',
            'SLA de 99.9% & Gestor de Conta',
        ],
        modules: [
            'dashboard', 'invoices', 'clients', 'products', 'services', 'suppliers',
            'reports', 'settings', 'hr', 'payroll', 'purchasing', 'crm', 'finance', 
            'accounting', 'treasury', 'fiscal', 'projects', 'training', 'pos',
            'logistics', 'fleet', 'hse', 'assets', 'production', 'marketing',
            'legal', 'budget', 'strategy', 'kpis', 'analytics', 'documents', 'maintenance', 'risks', 'expansion', 'recruitment', 'monitoring', 'calendar', 'approvals', 'quality', 'inventory'
        ],
    },
    TRIAL: {
        id: 'TRIAL',
        name: 'Trial de 14 Dias',
        subtitle: 'Exploração total do ecossistema',
        price: 0,
        annualPrice: 0,
        maxUsers: 5,
        color: '#10b981',
        modules: [
            'dashboard', 'invoices', 'clients', 'products', 'hr', 'finance', 'accounting', 'inventory', 'suppliers', 'reports', 'purchasing', 'fiscal'
        ],
        features: [
            'Acesso a todos os módulos',
            'Suporte prioritário',
            'Sincronização Cloud',
        ],
    },
};
