import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const PLANS = {
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
            'dashboard', 'invoices', 'clients', 'products', 'hr', 'finance', 'accounting', 'inventory', 'suppliers', 'reports', 'purchasing'
        ],
        features: [
            'Acesso a todos os módulos',
            'Suporte prioritário',
            'Sincronização Cloud',
        ],
    },
};

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const systemCompany = await prisma.company.upsert({
        where: { nif: '0000000000' },
        update: {},
        create: {
            name: 'VA ONEGEST System',
            nif: '0000000000',
            address: 'Central Luanda, Angola',
            email: 'system@va-onegest.co.ao',
            phone: '+244 000 000 000'
        }
    });

    // 2. Create Permissions
    // Lista completa de todas as permissões verificadas pelos middlewares RBAC em cada rota
    const perms = [
        // DASHBOARD
        'dashboard:view',
        // INVOICES
        'invoices:view', 'invoices:create', 'invoices:update', 'invoices:delete',
        'invoices:report', 'invoices:cancel', 'invoices:export', 'invoices:saft',
        // CLIENTS
        'clients:view', 'clients:create', 'clients:edit', 'clients:delete',
        // PRODUCTS & INVENTORY
        'products:view', 'products:create', 'products:edit', 'products:delete',
        'suppliers:view', 'suppliers:create', 'suppliers:edit', 'suppliers:delete',
        'inventory:view', 'inventory:manage', 'inventory:movements', 'inventory:adjustments',
        'services:view', 'services:create', 'services:edit', 'services:delete',
        // HR & SALARIES
        'hr:view', 'hr:manage',
        'employees:view', 'employees:create', 'employees:update', 'employees:edit', 'employees:delete',
        'payroll:view', 'payroll:manage', 'payroll:process', 'payroll:reports',
        'recruitment:view', 'recruitment:create', 'recruitment:update', 'recruitment:delete',
        'training:view', 'training:create', 'training:update', 'training:delete',
        'academy:view', 'courses:view',
        // FINANCE & TREASURY
        'finance:view', 'finance:create', 'finance:update', 'finance:delete', 'finance:manage',
        'accounting:view', 'accounting:create', 'accounting:update',
        'ledger:view', 'tax:view', 'tax:reports',
        'treasury:view', 'treasury:create', 'treasury:update',
        'cash:view', 'cash:movements',
        'budget:view', 'budget:create', 'budget:update', 'budget:delete', 'opex:view',
        'payments:view', 'payments:create', 'revenue:view',
        // FISCAL
        'fiscal:view', 'saft:export',
        // COMMERCIAL & CRM
        'pos:view', 'pos:manage', 'pos:sales', 'pos:close',
        'crm:view', 'crm:create', 'crm:update', 'crm:delete',
        'marketing:view', 'marketing:create', 'marketing:update', 'marketing:delete',
        'campaigns:view',
        // PURCHASING & OPERATIONS
        'purchasing:view', 'purchasing:create', 'purchasing:update', 'purchasing:delete',
        'logistics:view', 'logistics:create', 'logistics:update', 'logistics:delete',
        'fleet:view', 'fleet:manage', 'vehicles:view',
        'maintenance:view', 'maintenance:create', 'maintenance:update', 'maintenance:delete',
        'assets:view', 'assets:create', 'assets:update', 'assets:delete', 'assets:maintenance',
        'production:view', 'production:create', 'production:update', 'production:delete', 'mrp:view',
        // PROJECTS
        'projects:view', 'projects:create', 'projects:update', 'projects:delete', 'projects:manage',
        'tasks:view',
        // STRATEGY & KPIs
        'strategy:view', 'strategy:manage', 'planning:view',
        'kpis:view', 'kpis:create', 'kpis:update', 'performance:view',
        'risks:view', 'risks:create', 'risks:update', 'risks:delete', 'risks:manage',
        'analytics:view', 'analytics:manage',
        'expansion:view', 'expansion:create', 'expansion:update', 'expansion:delete',
        // LEGAL & COMPLIANCE
        'legal:view', 'legal:create', 'legal:update', 'legal:delete', 'contracts:view',
        'compliance:view', 'compliance:create', 'compliance:update', 'compliance:delete',
        'hse:view', 'safety:reports',
        'quality:view', 'quality:create', 'quality:update', 'quality:delete', 'standards:view',
        // DOCUMENTS & COMMUNICATIONS
        'documents:view', 'documents:upload', 'documents:create', 'documents:update', 'documents:delete',
        'communications:view', 'notifications:send',
        // CALENDAR & APPROVALS
        'calendar:view', 'calendar:create', 'calendar:update', 'calendar:delete', 'agenda:manage',
        'approvals:view', 'approvals:manage', 'approvals:create', 'approvals:update',
        // REPORTS
        'reports:view', 'reports:export',
        // EXPENSES
        'expenses:view', 'expenses:create', 'expenses:update', 'expenses:delete',
        // SYSTEM & SETTINGS
        'admin:access', 'settings:view', 'settings:manage', 'company:edit',
        'users:view', 'users:manage',
        'monitoring:view',
    ];

    for (const p of perms) {
        await prisma.permission.upsert({
            where: { name: p },
            update: {},
            create: { name: p }
        });
    }

    // 3. Create / Sync Global Roles
    // Usamos upsert + set para garantir que ao re-executar o seed as permissões ficam sempre actualizadas
    let adminRole = await prisma.role.findFirst({
        where: { companyId: null, name: 'ADMIN' }
    });

    if (!adminRole) {
        adminRole = await prisma.role.create({
            data: {
                name: 'ADMIN',
                description: 'Administrador de Empresa',
                companyId: null,
                permissions: {
                    connect: perms.map(p => ({ name: p }))
                }
            }
        });
    } else {
        // Sincronizar permissões — garante que novos perms adicionados ao array chegam ao role
        adminRole = await prisma.role.update({
            where: { id: adminRole.id },
            data: {
                permissions: {
                    set: perms.map(p => ({ name: p }))
                }
            }
        });
    }

    let userRole = await prisma.role.findFirst({
        where: { companyId: null, name: 'USER' }
    });

    const userPerms = ['dashboard:view', 'invoices:view', 'clients:view', 'products:view', 'reports:view'];
    if (!userRole) {
        userRole = await prisma.role.create({
            data: {
                name: 'USER',
                description: 'Utilizador Regular',
                companyId: null,
                permissions: {
                    connect: userPerms.map(p => ({ name: p }))
                }
            }
        });
    } else {
        userRole = await prisma.role.update({
            where: { id: userRole.id },
            data: {
                permissions: {
                    set: userPerms.map(p => ({ name: p }))
                }
            }
        });
    }


    // 4. Create Super Admin accounts
    await prisma.user.upsert({
        where: { email: 'superadmin@va-onegest.co.ao' },
        update: { password: hashedPassword, isActive: true },
        create: {
            companyId: systemCompany.id,
            name: 'Super Admin VA',
            email: 'superadmin@va-onegest.co.ao',
            password: hashedPassword,
            role: 'SUPER_ADMIN'
        }
    });
    console.log('✅ superadmin@va-onegest.co.ao criado');

    // Conta principal do sistema: system@va-onegest.co.ao / admin123
    await prisma.user.upsert({
        where: { email: 'system@va-onegest.co.ao' },
        update: { password: hashedPassword, isActive: true },
        create: {
            companyId: systemCompany.id,
            name: 'Sistema VA OneGest',
            email: 'system@va-onegest.co.ao',
            password: hashedPassword,
            role: 'SUPER_ADMIN'
        }
    });
    console.log('✅ system@va-onegest.co.ao criado (admin123)');

    // 5. Create a Demo Company
    const demoCompany = await prisma.company.upsert({
        where: { nif: '5401122334' },
        update: {},
        create: {
            name: 'VA ONEGEST Enterprise',
            nif: '5401122334',
            address: 'Edifício VA, Luanda Sul, Angola',
            email: 'geral@va-onegest.co.ao',
            phone: '+244 923 000 000'
        }
    });

    // 6. Create an Admin User for Demo Company
    await prisma.user.upsert({
        where: { email: 'admin@va-onegest.co.ao' },
        update: { password: hashedPassword, isActive: true, roleId: adminRole.id },
        create: {
            companyId: demoCompany.id,
            name: 'Administrador VA',
            email: 'admin@va-onegest.co.ao',
            password: hashedPassword,
            role: 'ADMIN',
            roleId: adminRole.id
        }
    });

    // 7. Check if subscription exists, if not create one
    const subCount = await prisma.subscription.count({ where: { companyId: demoCompany.id } });
    if (subCount === 0) {
        await prisma.subscription.create({
            data: {
                companyId: demoCompany.id,
                plan: 'PREMIUM',
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                price: 500000
            }
        });
    }

    // 8. Create many Clients for Demo Company
    const clientNames = [
        'Sonangol EP', 'Unitel SA', 'Africell Lda', 'Banco BAI', 'Standard Bank Angola',
        'TotalEnergies EP', 'Chevron Angola', 'Eni Angola', 'Movicel Telefone', 'Zap Luanda',
        'Cisneros Lda', 'Tchuma SA', 'Onga Lda', 'Viana Investimentos', 'Nova Vida Seguros'
    ];

    const currentClients = await prisma.client.count({ where: { companyId: demoCompany.id } });
    if (currentClients < 5) {
        const clients = [];
        for (const name of clientNames) {
            const client = await prisma.client.create({
                data: {
                    companyId: demoCompany.id,
                    name,
                    nif: `5000${Math.floor(Math.random() * 900000) + 100000}`,
                    email: `contato@${name.toLowerCase().replace(/\s+/g, '')}.co.ao`,
                    phone: `+244 923 ${Math.floor(Math.random() * 900000) + 100000}`,
                    creditLimit: Math.floor(Math.random() * 5000000) + 500000,
                    currentDebt: Math.floor(Math.random() * 200000)
                }
            });
            clients.push(client);
        }
        console.log(`Created ${clients.length} new clients`);
    }

    // 9. Products (upsert by [companyId, code])
    const prodTemplates = [
        { name: 'Consultoria Informática', price: 25000, stock: 0, code: 'SRV-001' },
        { name: 'Licença Software ERP', price: 150000, stock: 100, code: 'LIC-001' },
        { name: 'Portátil ThinkPad T14', price: 450000, stock: 12, code: 'HW-001' },
        { name: 'Monitor LG Ultrawide 34"', price: 180000, stock: 2, code: 'HW-002' },
        { name: 'Teclado Mecânico Pro', price: 45000, stock: 30, code: 'HW-003' }
    ];

    for (const p of prodTemplates) {
        await prisma.product.upsert({
            where: { companyId_code: { companyId: demoCompany.id, code: p.code } },
            update: { price: p.price, stock: p.stock },
            create: {
                companyId: demoCompany.id,
                name: p.name,
                code: p.code,
                price: p.price,
                cost: p.price * 0.7,
                vatRate: 14,
                margin: 30,
                stock: p.stock,
                minStock: 5
            }
        });
    }

    // 10. Invoices (check count to avoid duplicates on multiple runs)
    const invCount = await prisma.invoice.count({ where: { companyId: demoCompany.id } });
    if (invCount < 10) {
        const allClients = await prisma.client.findMany({ where: { companyId: demoCompany.id } });
        const allProducts = await prisma.product.findMany({ where: { companyId: demoCompany.id } });

        for (let i = 0; i < 20; i++) {
            const status = i % 3 === 0 ? 'PAID' : (i % 2 === 0 ? 'FINAL' : 'DRAFT');
            const randomClient = allClients[Math.floor(Math.random() * allClients.length)];
            const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
            const qty = Math.floor(Math.random() * 5) + 1;
            const subtotal = randomProduct.price * qty;
            const vat = subtotal * 0.14;
            const total = subtotal + vat;

            await prisma.invoice.create({
                data: {
                    companyId: demoCompany.id,
                    clientId: randomClient.id,
                    type: 'INVOICE',
                    number: `FT 2024/${(i + 1 + invCount).toString().padStart(3, '0')}`,
                    status,
                    issueDate: new Date(new Date().setDate(new Date().getDate() - i)),
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 30 - i)),
                    totalAmount: total,
                    totalVat: vat,
                    items: {
                        create: [{
                            productId: randomProduct.id,
                            quantity: qty,
                            unitPrice: randomProduct.price,
                            vatRate: 14,
                            totalAmount: total
                        }]
                    }
                }
            });
        }
        console.log('Created invoices');
    }

    // 11. Global messages
    await prisma.message.upsert({
        where: { id: 'msg-welcome' },
        update: {},
        create: {
            id: 'msg-welcome',
            title: 'Lançamento VA ONEGEST 2.0',
            content: 'Bem-vindos à nova versão da plataforma. Agora com suporte total a faturas certificadas!',
            isGlobal: true,
            targetRole: 'ALL'
        }
    });

    // 12. HR Seeding (Employees)
    const empCount = await prisma.employee.count({ where: { companyId: demoCompany.id } });
    if (empCount === 0) {
        const departments = ['Financeiro', 'Logística', 'Vendas', 'TI', 'RH'];
        const positions = ['Gestor', 'Técnico', 'Analista', 'Motorista', 'Assistente'];

        for (let i = 0; i < 10; i++) {
            await prisma.employee.create({
                data: {
                    companyId: demoCompany.id,
                    name: `Funcionário ${i + 1}`,
                    email: `func${i + 1}@va-onegest.co.ao`,
                    phone: `+244 900 000 00${i}`,
                    position: positions[Math.floor(Math.random() * positions.length)],
                    department: departments[Math.floor(Math.random() * departments.length)],
                    salary: 150000 + (Math.random() * 300000),
                    status: 'ACTIVE'
                }
            });
        }
        console.log('Created 10 employees');
    }

    // 13. Logistics Seeding (Vehicles & Transports)
    // 13. Logistics Seeding (Vehicles & Transports)
    // const vehicleCount = await prisma.vehicle.count({ where: { companyId: demoCompany.id } });
    // if (vehicleCount === 0) { ... }

    // 13.1 Stock Movements
    const stockCount = await prisma.stockMovement.count();
    if (stockCount === 0) {
        const prod = await prisma.product.findFirst({ where: { companyId: demoCompany.id } });
        if (prod) {
            await prisma.stockMovement.create({
                data: {
                    productId: prod.id,
                    type: 'ENTRY',
                    quantity: 50,
                    notes: 'Stock inicial de demonstração'
                }
            });
        }
        console.log('Created Stock Movements');
    }

    // 14. ERP: Financeiro (AP/AR)
    const finCount = await prisma.financialEntry.count({ where: { companyId: demoCompany.id } });
    if (finCount === 0) {
        await prisma.financialEntry.createMany({
            data: [
                { companyId: demoCompany.id, description: 'Renda Escritório Central', type: 'PAYABLE', amount: 450000, dueDate: new Date(), category: 'Renda', status: 'PENDING' },
                { companyId: demoCompany.id, description: 'Serviços de Manutenção', type: 'PAYABLE', amount: 85000, dueDate: new Date(), category: 'Manutenção', status: 'PAID', paidAt: new Date() },
                { companyId: demoCompany.id, description: 'Venda de Consultoria Especializada', type: 'RECEIVABLE', amount: 1200000, dueDate: new Date(), category: 'Consultoria', status: 'PENDING' }
            ]
        });
        console.log('Created financial entries');
    }

    // 15. ERP: Compras (Purchase Orders)
    const poCount = await prisma.purchaseOrder.count({ where: { companyId: demoCompany.id } });
    if (poCount === 0) {
        // Need a supplier for PO. Let's create one.
        const supplier = await prisma.supplier.create({
            data: {
                companyId: demoCompany.id,
                name: 'DISTRIBUIDORA ANGOLA S.A.',
                nif: '5401010101',
                email: 'vendas@distangola.ao',
                phone: '+244 912 000 000',
                address: 'Zona Industrial de Viana, Luanda'
            }
        });

        await prisma.purchaseOrder.create({
            data: {
                companyId: demoCompany.id,
                supplierId: supplier.id,
                number: 'OC 2024/001',
                status: 'SENT',
                totalAmount: 500000,
                notes: 'Urgente para stock de Verão'
            }
        });
        console.log('Created sample purchase order');
    }

    // 16. ERP: Projetos
    const projectCount = await prisma.project.count({ where: { companyId: demoCompany.id } });
    if (projectCount === 0) {
        await prisma.project.create({
            data: {
                companyId: demoCompany.id,
                name: 'Implementação Cloud Luanda',
                description: 'Migração de servidores locais para infraestrutura cloud em Luanda Sul.',
                status: 'IN_PROGRESS',
                startDate: new Date(),
                budget: 5000000,
                tasks: {
                    create: [
                        { title: 'Levantamento de Requisitos', status: 'DONE', priority: 'HIGH' },
                        { title: 'Configuração de Instâncias EC2', status: 'IN_PROGRESS', priority: 'MEDIUM' },
                        { title: 'Migração de Bases de Dados', status: 'TODO', priority: 'HIGH' }
                    ]
                }
            }
        });
        console.log('Created sample project with tasks');
    }

    // 17. VA ONEGEST Advanced Modules Seeding
    console.log('--- Seeding Advanced Modules ---');

    // Strategic Planning
    const objectiveCount = await prisma.strategicObjective.count({ where: { companyId: demoCompany.id } });
    if (objectiveCount === 0) {
        await prisma.strategicObjective.create({
            data: {
                companyId: demoCompany.id,
                title: 'Expansão Regional - Sul de Angola',
                description: 'Aumentar a quota de mercado nas províncias da Huíla e Namibe.',
                startDate: new Date(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                status: 'ON_TRACK',
                progress: 45,
                keyResults: {
                    create: [
                        { title: 'Abertura de 3 novos centros logísticos', current: 1, target: 3, unit: 'unidades', progress: 33 },
                        { title: 'Contratação de 20 técnicos locais', current: 12, target: 20, unit: 'pessoas', progress: 60 }
                    ]
                }
            }
        });
        console.log('Created Strategic Objectives');
    }

    // Training / Academy
    const trainingCount = await prisma.trainingCourse.count({ where: { companyId: demoCompany.id } });
    if (trainingCount === 0) {
        const course1 = await prisma.trainingCourse.create({
            data: {
                companyId: demoCompany.id,
                title: 'Segurança Cibernética para Gestores',
                category: 'TI',
                status: 'ACTIVE',
                enrolled: 45,
                rating: 4.8,
                lessons: {
                    create: [
                        { title: 'Introdução à Segurança', order: 1 },
                        { title: 'Phishing e Engenharia Social', order: 2 }
                    ]
                }
            }
        });
        const course2 = await prisma.trainingCourse.create({
            data: {
                companyId: demoCompany.id,
                title: 'Liderança e Gestão de Conflitos',
                category: 'Soft Skills',
                status: 'ACTIVE',
                enrolled: 120,
                rating: 4.5,
                lessons: {
                    create: [
                        { title: 'Estilos de Liderança', order: 1 },
                        { title: 'Comunicação Não-Violenta', order: 2 }
                    ]
                }
            }
        });
        console.log('Created Training Courses and Lessons');
    }

    // Assets & Maintenance
    const assetCount = await prisma.asset.count({ where: { companyId: demoCompany.id } });
    if (assetCount === 0) {
        const asset = await prisma.asset.create({
            data: {
                companyId: demoCompany.id,
                name: 'Gerador Industrial Caterpillar C18',
                code: 'AST-GER-001',
                category: 'ENERGIA',
                status: 'OPERATIONAL',
                health: 92,
                maintenance: {
                    create: [
                        { description: 'Troca de filtros e óleo', cost: 125000, type: 'PREVENTIVE', status: 'COMPLETED' },
                        { description: 'Reparação de alternador', cost: 45000, type: 'CORRECTIVE', status: 'COMPLETED' }
                    ]
                }
            }
        });
        console.log('Created Assets and Maintenance records');
    }

    // Legal & Contracts
    const contractCount = await prisma.contract.count({ where: { companyId: demoCompany.id } });
    if (contractCount === 0) {
        await prisma.contract.createMany({
            data: [
                { companyId: demoCompany.id, title: 'Licenciamento SAP Enterprise', entity: 'SAP Angola', value: 12000000, currency: 'AOA', status: 'ACTIVE', expiryDate: new Date('2025-12-31') },
                { companyId: demoCompany.id, title: 'Aluguer de Pavilhão Viana', entity: 'Imobiliária Sul Lda', value: 2500000, currency: 'AOA', status: 'ACTIVE', expiryDate: new Date('2024-11-30') }
            ]
        });
        console.log('Created Legal Contracts');
    }

    // Quality & HSE
    const inspectionCount = await prisma.qualityInspection.count({ where: { companyId: demoCompany.id } });
    if (inspectionCount === 0) {
        await prisma.qualityInspection.create({
            data: {
                companyId: demoCompany.id,
                item: 'Lote #LX-882 (Polímeros)',
                result: 'PASSED',
                score: 98.5,
                inspector: 'Eng. Carlos Baptista',
                notes: 'Conforme normas ISO 9001'
            }
        });
        console.log('Created Quality Inspections');
    }

    const incidentCount = await prisma.hSEIncident.count({ where: { companyId: demoCompany.id } });
    if (incidentCount === 0) {
        await prisma.hSEIncident.create({
            data: {
                companyId: demoCompany.id,
                title: 'Derrame de Óleo Hidráulico',
                type: 'AMBIENTAL',
                location: 'Sector de Prensas',
                level: 'MEDIUM',
                reporter: 'João Manuel',
                status: 'CLOSED'
            }
        });
        console.log('Created HSE Incidents');
    }

    // Expenses
    const expenseCount = await prisma.expenseClaim.count({ where: { companyId: demoCompany.id } });
    if (expenseCount === 0) {
        await prisma.expenseClaim.createMany({
            data: [
                { companyId: demoCompany.id, title: 'Voo Luanda-Cabinda', category: 'TRAVEL', amount: 85000, status: 'APPROVED' },
                { companyId: demoCompany.id, title: 'Jantar com Cliente Unitel', category: 'MEAL', amount: 15400, status: 'PENDING' }
            ]
        });
        console.log('Created Expense Claims');
    }

    // 17.1 Documents Management
    const docCount = await prisma.document.count({ where: { companyId: demoCompany.id } });
    if (docCount === 0) {
        await prisma.document.createMany({
            data: [
                { companyId: demoCompany.id, name: 'Alvará Comercial 2024.pdf', type: 'PDF', size: '2.4MB', category: 'LEGAL', status: 'VALID', department: 'Administração', owner: 'Mário Silva' },
                { companyId: demoCompany.id, name: 'Manual do Funcionário v2.docx', type: 'DOCX', size: '1.2MB', category: 'HR', status: 'VALID', department: 'RH', owner: 'Ana Santos' },
                { companyId: demoCompany.id, name: 'Certidão AGT - Março.pdf', type: 'PDF', size: '850KB', category: 'FISCAL', status: 'VALID', department: 'Financeiro', owner: 'Carlos Dinis' }
            ]
        });
        console.log('Created Documents');
    }

    // 17.2 Marketing Campaigns
    const campaignCount = await prisma.marketingCampaign.count({ where: { companyId: demoCompany.id } });
    if (campaignCount === 0) {
        await prisma.marketingCampaign.createMany({
            data: [
                { companyId: demoCompany.id, title: 'Promoção de Inverno 2024', platform: 'SOCIAL_MEDIA', status: 'ACTIVE', budget: 500000, engagement: 1250 },
                { companyId: demoCompany.id, title: 'Webinar Novos Serviços', platform: 'EMAIL', status: 'FINISHED', budget: 50000, engagement: 450 }
            ]
        });
        console.log('Created Marketing Campaigns');
    }

    // 17.3 POS Terminals & Sales
    const posCount = await prisma.pOSTerminal.count({ where: { companyId: demoCompany.id } });
    if (posCount === 0) {
        const terminal = await prisma.pOSTerminal.create({
            data: {
                companyId: demoCompany.id,
                name: 'Terminal Loja Principal',
                description: 'Terminal POS no balcão principal de atendimento',
                status: 'ACTIVE'
            }
        });

        await prisma.pOSSale.createMany({
            data: [
                { companyId: demoCompany.id, terminalId: terminal.id, amount: 15500, itemsCount: 3, operator: 'João Caixa', status: 'COMPLETED' },
                { companyId: demoCompany.id, terminalId: terminal.id, amount: 4200, itemsCount: 1, operator: 'João Caixa', status: 'COMPLETED' }
            ]
        });
        console.log('Created POS Terminals and Sales');
    }

    // 17.4 Risks & Compliance
    const riskCount = await prisma.risk.count({ where: { companyId: demoCompany.id } });
    if (riskCount === 0) {
        await prisma.risk.createMany({
            data: [
                { companyId: demoCompany.id, title: 'Flutuação Cambial (AOA/USD)', category: 'FINANCIAL', level: 'HIGH', probability: 4, impact: 5, status: 'Mitigated', owner: 'CFO' },
                { companyId: demoCompany.id, title: 'Ruptura de Stock (Importados)', category: 'OPERATIONAL', level: 'MEDIUM', probability: 3, impact: 4, status: 'OPEN', owner: 'Gestor Logística' }
            ]
        });
        console.log('Created Risks');
    }

    // 17.5 Financial Budgeting
    const budgetCount = await prisma.budgetLine.count({ where: { companyId: demoCompany.id } });
    if (budgetCount === 0) {
        await prisma.budgetLine.createMany({
            data: [
                { companyId: demoCompany.id, department: 'TI', category: 'Infraestrutura', planned: 5000000, actual: 4200000, variance: 800000, period: '2024' },
                { companyId: demoCompany.id, department: 'Marketing', category: 'Publicidade', planned: 2000000, actual: 2150000, variance: -150000, period: '2024' }
            ]
        });
        console.log('Created Budget Lines');
    }

    // 17.6 HR: Recruitment (Candidates)
    const candCount = await prisma.candidate.count({ where: { companyId: demoCompany.id } });
    if (candCount === 0) {
        await prisma.candidate.createMany({
            data: [
                { companyId: demoCompany.id, name: 'Sérgio Mendes', position: 'Analista de Sistemas', email: 'sergio@email.com', stage: 'INTERVIEW', rating: 4 },
                { companyId: demoCompany.id, name: 'Marta Afonso', position: 'Contabilista Sénior', email: 'marta.af@email.com', stage: 'APPLIED', rating: 3 }
            ]
        });
        console.log('Created Candidates');
    }

    // 17.7 KPIs & Analytics
    const kpiCount = await prisma.kPIIndicator.count({ where: { companyId: demoCompany.id } });
    if (kpiCount === 0) {
        await prisma.kPIIndicator.createMany({
            data: [
                { companyId: demoCompany.id, name: 'Margem de Lucro Bruta', department: 'Financeiro', current: 28.5, target: 30, unit: '%', trend: -1.2, period: 'Mensal' },
                { companyId: demoCompany.id, name: 'NPS (Satisfação Cliente)', department: 'Comercial', current: 42, target: 45, unit: 'score', trend: 5.4, period: 'Mensal' }
            ]
        });
        console.log('Created KPIs');
    }

    // 17.8 Fleet Management (Advanced)
    const fleetCount = await prisma.fleetVehicle.count({ where: { companyId: demoCompany.id } });
    if (fleetCount === 0) {
        const fleetV = await prisma.fleetVehicle.create({
            data: {
                companyId: demoCompany.id,
                plate: 'LD-10-20-VA',
                brand: 'Ford',
                model: 'Ranger',
                year: 2022,
                type: 'PICKUP',
                driver: 'Manuel Gomes',
                km: 45000,
                insurance: new Date('2024-12-31')
            }
        });

        await prisma.fuelRecord.create({
            data: {
                companyId: demoCompany.id,
                fleetVehicleId: fleetV.id,
                liters: 65,
                cost: 10400,
                km: 44900,
                station: 'Sonangol Viana'
            }
        });
        console.log('Created Fleet Management data');
    }

    // 17.9 Bank Accounts & Payment Methods
    const bankCount = await prisma.bankAccount.count({ where: { companyId: demoCompany.id } });
    if (bankCount === 0) {
        await prisma.bankAccount.createMany({
            data: [
                { companyId: demoCompany.id, bank: 'BAI', iban: 'AO06.0040.0000.1234.5678.9012.3', balance: 12500000, type: 'CURRENT', color: '#003366' },
                { companyId: demoCompany.id, bank: 'Standard Bank', iban: 'AO06.0010.0000.9876.5432.1098.7', balance: 5000000, type: 'SAVINGS', color: '#00aed1' }
            ]
        });
        console.log('Created Bank Accounts');
    }

    const payMethodCount = await prisma.paymentMethod.count();
    if (payMethodCount === 0) {
        await prisma.paymentMethod.createMany({
            data: [
                { name: 'Transferência Bancária (IBAN)', type: 'BANK_TRANSFER' },
                { name: 'Multicaixa Express', type: 'MOBILE_PAYMENT' },
                { name: 'Dinheiro / Numerário', type: 'CASH' }
            ]
        });
        console.log('Created Payment Methods');
    }

    // 17.10 Approvals Workflow
    const approvalCount = await prisma.approvalRequest.count({ where: { companyId: demoCompany.id } });
    if (approvalCount === 0) {
        await prisma.approvalRequest.create({
            data: {
                companyId: demoCompany.id,
                title: 'Compra de Novos Laptops (TI)',
                type: 'PURCHASE',
                requester: 'Mário Silva',
                department: 'TI',
                amount: 1500000,
                status: 'PENDING',
                priority: 'HIGH',
                steps: {
                    create: [
                        { role: 'MANAGER', approverName: 'Carlos Gestor', status: 'APPROVED', order: 1 },
                        { role: 'FINANCE', status: 'PENDING', order: 2 }
                    ]
                }
            }
        });
        console.log('Created Approval Requests');
    }

    // 17.11 Operations & Expansion
    const productionCount = await prisma.productionOrder.count({ where: { companyId: demoCompany.id } });
    if (productionCount === 0) {
        await prisma.productionOrder.create({
            data: {
                companyId: demoCompany.id,
                orderNumber: 'OP-2024-001',
                productName: 'Componente Delta V3',
                quantity: 500,
                status: 'IN_PROGRESS',
                progress: 35,
                priority: 'HIGH'
            }
        });
        console.log('Created Production Orders');
    }

    const marketCount = await prisma.market.count({ where: { companyId: demoCompany.id } });
    if (marketCount === 0) {
        await prisma.market.createMany({
            data: [
                { companyId: demoCompany.id, name: 'Mercado Província da Huíla', country: 'Angola', status: 'ACTIVE', entryYear: 2022, revenue: 15000000 },
                { companyId: demoCompany.id, name: 'Mercado Namíbia', country: 'Namíbia', status: 'PROSPECTING', entryYear: 2024, revenue: 0 }
            ]
        });
        console.log('Created Markets');
    }

    const eventCount = await prisma.calendarEvent.count({ where: { companyId: demoCompany.id } });
    if (eventCount === 0) {
        await prisma.calendarEvent.createMany({
            data: [
                { 
                    companyId: demoCompany.id, 
                    title: 'Reunião de Direcção Semanal', 
                    type: 'MEETING', 
                    date: new Date(), 
                    startTime: '09:00', 
                    endTime: '10:30',
                    location: 'Sala de Conferências A'
                },
                { 
                    companyId: demoCompany.id, 
                    title: 'Formação Integrada VA OneGest', 
                    type: 'TRAINING', 
                    date: new Date(new Date().setDate(new Date().getDate() + 2)), 
                    startTime: '14:00', 
                    endTime: '17:00',
                    isVirtual: true
                }
            ]
        });
        console.log('Created Calendar Events');
    }

    // 18. Subscription Plans Seeding
    console.log('--- Seeding Subscription Plans (Source of Truth) ---');
    for (const planId in PLANS) {
        const p = (PLANS as any)[planId];
        await (prisma as any).subscriptionPlan.upsert({
            where: { id: p.id },
            update: {
                name: p.name,
                subtitle: p.subtitle || p.description,
                price: p.price,
                annualPrice: p.annualPrice,
                maxUsers: p.maxUsers,
                color: p.color,
                popular: p.popular || false,
                features: p.features,
                modules: p.modules
            },
            create: {
                id: p.id,
                name: p.name,
                subtitle: p.subtitle || p.description,
                price: p.price,
                annualPrice: p.annualPrice,
                maxUsers: p.maxUsers,
                color: p.color,
                popular: p.popular || false,
                features: p.features,
                modules: p.modules
            }
        });
    }
    console.log('--- Advanced Modules Seeding Finished ---');

    // 19. Trusted Partners Seeding
    console.log('--- Seeding Trusted Partners ---');
    const trustedPartnersCount = await prisma.trustedPartner.count();
    if (trustedPartnersCount === 0) {
        await prisma.trustedPartner.createMany({
            data: [
                { name: 'ÓPTICA ZIDANE', order: 1 },
                { name: 'FANARA', order: 2 },
                { name: 'VA TECH', order: 3 },
                { name: 'LUCLIMA', order: 4 }
            ]
        });
        console.log('Created Trusted Partners');
    }

    console.log('Seeding finished successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
