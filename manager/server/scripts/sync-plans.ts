import { PrismaClient } from '@prisma/client';
import process from 'process';

const prisma = new PrismaClient();

const PLANS = {
    BASIC_DAILY: {
        id: 'BASIC_DAILY',
        name: 'Básico Diário',
        subtitle: 'Ideal para facturação pontual e recorrente diária',
        price: 2500,
        annualPrice: 2500 * 365,
        maxUsers: 1,
        color: '#10b981',
        features: [
            'Facturação Rápida & Certificada',
            'Gestão de Clientes',
            'Dashboard Básico',
            'Geração de SAF-T (AO)',
        ],
        modules: [
            'dashboard', 'invoices', 'clients', 'settings', 'fiscal'
        ],
    },
    STARTER: {
        id: 'STARTER',
        name: 'Starter (PMEs)',
        subtitle: 'Ideal para PMEs e startups em fase inicial',
        price: 45000,
        annualPrice: 450000,
        maxUsers: 5,
        color: '#6366f1',
        features: [
            'Facturação & Clientes (Cadastros)',
            'Geração de SAF-T (AO) Básico',
            'Gestão de Produtos',
            'Relatórios Mensais de Vendas',
            'Suporte por email',
        ],
        modules: [
            'dashboard', 'invoices', 'clients', 'products', 'reports', 'settings'
        ],
    },
    PROFESSIONAL: {
        id: 'PROFESSIONAL',
        name: 'Professional (Crescimento)',
        subtitle: 'Para empresas em expansão estruturada',
        price: 120000,
        annualPrice: 1200000,
        maxUsers: 25,
        color: '#0ea5e9',
        popular: true,
        features: [
            'Tudo do Starter +',
            'Gestão de Fornecedores & Serviços',
            'Finanças Avançadas (Contas Correntes)',
            'RH (Processamento Salarial)',
            'CRM & Pipeline Comercial',
            'Suporte prioritário 8x5',
        ],
        modules: [
            'dashboard', 'invoices', 'clients', 'products', 'services', 'suppliers',
            'reports', 'settings', 'hr', 'payroll', 'purchasing', 'crm', 'finance', 
            'accounting', 'treasury', 'fiscal'
        ],
    },
    ENTERPRISE: {
        id: 'ENTERPRISE',
        name: 'Enterprise (Corporativo)',
        subtitle: 'Controlo total para grandes organizações',
        price: 350000,
        annualPrice: 3500000,
        maxUsers: 999,
        color: '#f59e0b',
        features: [
            'Ecossistema Completo VA',
            'BI & Analytics (Gestão de Indicadores)',
            'Logística, Frota & Produção',
            'Controlo Fiscal & Auditoria AGT',
            'Planeamento Estratégico & KPIs',
            'Módulo POS Multi-terminal',
            'SLA de 99.9% & Gestor de Conta',
        ],
        modules: [
            'dashboard', 'invoices', 'clients', 'products', 'services', 'suppliers',
            'reports', 'settings', 'hr', 'payroll', 'purchasing', 'crm', 'finance', 
            'accounting', 'treasury', 'fiscal', 'projects', 'training', 'pos',
            'logistics', 'fleet', 'hse', 'assets', 'production', 'marketing',
            'legal', 'budget', 'strategy', 'kpis', 'analytics', 'documents'
        ],
    },
};

async function main() {
    console.log('🔄 Sincronizando Matriz de Planos...');
    
    for (const [key, plan] of Object.entries(PLANS)) {
        await (prisma as any).subscriptionPlan.upsert({
            where: { id: plan.id },
            update: plan,
            create: plan,
        });
        console.log(`✅ Plano ${plan.name} sincronizado.`);
    }
    
    console.log('🚀 Matriz de Planos atualizada com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
