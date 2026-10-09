import prisma from '../lib/prisma';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PLANS } from '../config/plans';
import { SaasService } from '../services/SaasService';
import { AuditService } from '../services/AuditService';


export class CompanyAdminController {
    // USER MANAGEMENT
    static async getUsers(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            const users = await prisma.user.findMany({
                where: { companyId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true
                }
            });
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar utilizadores' });
        }
    }

    static async createUser(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            const { name, email, password, role } = req.body;

            if (role === 'SUPER_ADMIN') {
                return res.status(403).json({ error: 'Não é possível criar um Super Admin' });
            }

            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) return res.status(400).json({ error: 'Email já registado' });

            const hashedPassword = await bcrypt.hash(password, 12);

            const roleName = role || 'USER';

            // Look up the role record to get its ID (global or company specific)
            const roleRecord = await prisma.role.findFirst({
                where: {
                    name: roleName,
                    OR: [{ companyId }, { companyId: null }]
                }
            });

            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: roleName,
                    roleId: roleRecord?.id,
                    companyId,
                    isActive: true
                }
            });

            const { password: _, ...userWithoutPassword } = newUser;

            await AuditService.log({
                companyId: companyId as string,
                userId: (req.user as any)?.id,
                action: 'CREATE_USER',
                entity: 'USER',
                entityId: newUser.id,
                details: `Utilizador ${email} criado com perfil ${roleName}`
            });

            res.status(201).json(userWithoutPassword);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar utilizador' });
        }
    }

    static async toggleUserStatus(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const companyId = req.companyId || (req.user as any)?.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID not found' });

            const user = await prisma.user.findFirst({ where: { id, companyId } });
            if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });
            if (user.role === 'SUPER_ADMIN') return res.status(403).json({ error: 'Não é possível desativar Super Admin' });

            const updated = await prisma.user.update({
                where: { id },
                data: { isActive: !user.isActive }
            });

            await AuditService.log({
                companyId: companyId as string,
                userId: (req.user as any)?.id,
                action: updated.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
                entity: 'USER',
                entityId: id,
                details: `Estado do utilizador alterado para ${updated.isActive ? 'ativo' : 'inativo'}`
            });

            res.json({ message: `Utilizador ${updated.isActive ? 'ativado' : 'desativado'}` });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao alterar estado do utilizador' });
        }
    }

    static async updateUser(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const companyId = req.companyId;
            const { name, email, password, role } = req.body;

            const existingUser = await prisma.user.findFirst({ where: { id, companyId: companyId as string } });
            if (!existingUser) return res.status(404).json({ error: 'Utilizador não encontrado' });
            if (existingUser.role === 'SUPER_ADMIN') return res.status(403).json({ error: 'Não é possível editar Super Admin' });

            const updateData: any = { name, email, role };

            if (password) {
                updateData.password = await bcrypt.hash(password, 12);
            }

            if (role && role !== existingUser.role) {
                const roleRecord = await prisma.role.findFirst({
                    where: {
                        name: role,
                        OR: [{ companyId }, { companyId: null }]
                    }
                });
                updateData.roleId = roleRecord?.id;
            }

            const updated = await prisma.user.update({
                where: { id },
                data: updateData,
                select: { id: true, name: true, email: true, role: true, isActive: true }
            });

            await AuditService.log({
                companyId: companyId as string,
                userId: (req.user as any)?.id,
                action: 'UPDATE_USER',
                entity: 'USER',
                entityId: id,
                details: `Dados do utilizador atualizados`
            });

            res.json(updated);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar utilizador' });
        }
    }

    static async deleteUser(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const companyId = req.companyId;

            const user = await prisma.user.findFirst({ where: { id, companyId: companyId as string } });
            if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });
            if (user.role === 'SUPER_ADMIN') return res.status(403).json({ error: 'Não é possível eliminar Super Admin' });

            await prisma.user.delete({ where: { id } });

            await AuditService.log({
                companyId: companyId as string,
                userId: (req.user as any)?.id,
                action: 'DELETE_USER',
                entity: 'USER',
                entityId: id,
                details: `Utilizador ${user.email} eliminado`
            });

            res.json({ message: 'Utilizador removido com sucesso' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao eliminar utilizador' });
        }
    }

    // AUDIT LOGS
    static async getAuditLogs(req: Request, res: Response) {
        try {
            const user = req.user as any;
            const companyId = req.companyId;

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const search = req.query.search as string || '';
            const skip = (page - 1) * limit;

            const whereClause: any = {};
            
            // SUPER_ADMIN vê os logs de todo o sistema
            if (user?.role?.toUpperCase() !== 'SUPER_ADMIN') {
                if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
                whereClause.companyId = companyId;
            }
            
            if (search) {
                whereClause.OR = [
                    { action: { contains: search, mode: 'insensitive' } },
                    { entity: { contains: search, mode: 'insensitive' } },
                    { user: { name: { contains: search, mode: 'insensitive' } } }
                ];
            }

            const logs = await prisma.auditLog.findMany({
                where: whereClause,
                include: {
                    user: { select: { name: true, email: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: skip
            });

            const total = await prisma.auditLog.count({ where: whereClause });

            res.json({ logs, total, page, limit });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao carregar logs de auditoria' });
        }
    }

    // SUBSCRIPTION
    static async getSubscriptionInfo(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            const subscription = await prisma.subscription.findFirst({
                where: { companyId },
                orderBy: { createdAt: 'desc' }
            });
            const company = await prisma.company.findUnique({
                where: { id: companyId },
                select: { 
                    enabledModules: true, 
                    name: true, 
                    email: true,
                    address: true,
                    logo: true,
                    capitalSocial: true,
                    registryOffice: true,
                    nif: true,
                    phone: true
                }
            });

            const userCount = await prisma.user.count({ where: { companyId } });
            
            // Fetch plans from database instead of static definition
            const dbPlans = await (prisma as any).subscriptionPlan.findMany({
                orderBy: { price: 'asc' }
            });
            
            // Format plans to match the expected structure
            const formattedPlans = dbPlans.reduce((acc: any, plan: any) => {
                acc[plan.id] = plan;
                return acc;
            }, {} as Record<string, any>);

            res.json({ subscription, company, userCount, plans: formattedPlans });
        } catch (error) {
            console.error('[GetSubscriptionInfo]', error);
            res.status(500).json({ error: 'Erro ao carregar informação de subscrição' });
        }
    }

    // PLANS (dynamic from db)
    static async getPlans(_req: Request, res: Response) {
        try {
            const dbPlans = await (prisma as any).subscriptionPlan.findMany({
                orderBy: { price: 'asc' }
            });
            
            const formattedPlans = dbPlans.reduce((acc: any, plan: any) => {
                acc[plan.id] = plan;
                return acc;
            }, {} as Record<string, any>);
            
            res.json(formattedPlans);
        } catch (error) {
            console.error('[GetPlans]', error);
            res.status(500).json({ error: 'Erro ao buscar planos' });
        }
    }

    // UPGRADE / CHANGE PLAN
    static async upgradePlan(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            const { plan, billing } = req.body;

            // Use central SaasService to handle both subscription logic and internal platform invoicing
            const result = await SaasService.processSubscriptionPayment(companyId, plan, billing || 'MONTHLY');

            res.json({ 
                message: `Plano ${plan} activado com sucesso!`, 
                subscription: result.newSub,
                invoiceNumber: result.invoice.number 
            });
        } catch (error: any) {
            console.error('[UpgradePlan Error]', error);
            res.status(500).json({ error: error.message || 'Erro ao actualizar plano' });
        }
    }


    static async cancelSubscription(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'ID da Empresa não encontrado.' });

            // Find current active subscription
            const sub = await prisma.subscription.findFirst({
                where: { companyId, status: 'ACTIVE' }
            });

            if (!sub) return res.status(404).json({ error: 'Nenhuma subscrição activa encontrada.' });

            // Cancel immediately by setting status to CANCELLED and endDate to now
            await prisma.subscription.update({
                where: { id: sub.id },
                data: { 
                    status: 'CANCELLED',
                    endDate: new Date() // Force immediate expiration
                }
            });

            res.json({ message: 'Subscrição cancelada com sucesso. O acesso aos módulos foi revogado.' });
        } catch (error) {
            console.error('[CancelSubscription]', error);
            res.status(500).json({ error: 'Erro ao cancelar subscrição' });
        }
    }


    // SETUP DEMO DATA (Everything functional)
    static async setupDemoData(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'ID da Empresa não encontrado.' });

            // Check if data already exists to avoid duplicates (optional, but good)
            const count = await prisma.client.count({ where: { companyId } });
            if (count > 0) return res.status(400).json({ error: 'A empresa já possui dados. O setup de demonstração só pode ser executado em contas limpas.' });

            // 1. Create a dummy client
            const client = await prisma.client.create({
                data: {
                    companyId,
                    name: 'CLIENTE DEMO S.A.',
                    nif: '5401010101',
                    email: 'demo@cliente.ao',
                    phone: '+244 900 000 000',
                    address: 'Rua da Demo, Luanda',
                    creditLimit: 5000000
                }
            });

            // 2. Create a dummy product
            const product = await prisma.product.create({
                data: {
                    companyId,
                    name: 'PRODUTO ESTRATÉGICO VA-1',
                    code: 'VA-PROD-001',
                    description: 'Produto de demonstração para testes de sistema.',
                    category: 'DIVERSOS',
                    unit: 'UN',
                    purchasePrice: 85000,
                    salePrice: 150000,
                    price: 150000,
                    cost: 85000,
                    stock: 50,
                    minStock: 10
                }
            });

            // 3. Create a dummy invoice
            await prisma.invoice.create({
                data: {
                    companyId,
                    clientId: client.id,
                    type: 'FT',
                    number: `FT ${new Date().getFullYear()}/0001`,
                    status: 'PAID',
                    totalAmount: 171000,
                    totalVat: 21000,
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    items: {
                        create: {
                            productId: product.id,
                            quantity: 1,
                            unitPrice: 150000,
                            vatRate: 14,
                            totalAmount: 171000
                        }
                    }
                }
            });

            // 4. Create a dummy campaign
            await prisma.marketingCampaign.create({
                data: {
                    companyId,
                    title: 'CAMPANHA DE LANÇAMENTO VA',
                    platform: 'MULTICANAL',
                    budget: 2500000,
                    status: 'ACTIVE',
                    description: 'Marketing de ativação para novos módulos.',
                    engagement: 85
                }
            });

            // 5. Create a strategic objective
            await prisma.strategicObjective.create({
                data: {
                    companyId,
                    title: 'EXPANSÃO DE QUOTA DE MERCADO',
                    description: 'Aumentar presença no sector industrial em 15%.',
                    status: 'ON_TRACK',
                    progress: 45,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                    keyResults: {
                        create: {
                            title: 'NOVOS CLIENTES CORPORATIVOS',
                            target: 20,
                            current: 9,
                            unit: ' UN',
                            progress: 45
                        }
                    }
                }
            });

            // 6. Create Employee
            await prisma.employee.create({
                data: {
                    companyId,
                    name: 'CONSELHEIRO DEMO',
                    email: 'conselheiro@demo.ao',
                    position: 'Director de Operações',
                    department: 'ADMINISTRAÇÃO',
                    status: 'ACTIVE'
                }
            });

            // 7. Create POS Terminal & Sales
            const terminal = await prisma.pOSTerminal.create({
                data: {
                    companyId,
                    name: 'TERMINAL LUANDA-CENTRO',
                    description: 'Terminal principal do hub comercial.',
                    status: 'ACTIVE'
                }
            });

            await prisma.pOSSale.createMany({
                data: [
                    { companyId, terminalId: terminal.id, amount: 15400, itemsCount: 4, operator: 'OP-023' },
                    { companyId, terminalId: terminal.id, amount: 8200, itemsCount: 2, operator: 'OP-023' },
                    { companyId, terminalId: terminal.id, amount: 45000, itemsCount: 12, operator: 'OP-055' },
                ]
            });

            // 8. Create Bank Account
            const bankAccount = await prisma.bankAccount.create({
                data: {
                    companyId,
                    bank: 'BANCO BAI - SEDE',
                    iban: 'AO06 0040 0000 1234 5678 9012 3',
                    balance: 12500000,
                    type: 'CURRENT',
                    color: 'indigo'
                }
            });

            // 9. Create Financial Entries
            await prisma.financialEntry.createMany({
                data: [
                    { 
                        companyId, 
                        description: 'VENDA DE SERVIÇOS CONSULTORIA', 
                        amount: 2500000, 
                        type: 'RECEIVABLE', 
                        category: 'REVENUE', 
                        status: 'PAID',
                        dueDate: new Date(),
                        paidAt: new Date()
                    },
                    { 
                        companyId, 
                        description: 'PAGAMENTO DE RENDAS ESCRITÓRIO', 
                        amount: 450000, 
                        type: 'PAYABLE', 
                        category: 'OPERATIONAL', 
                        status: 'PAID',
                        dueDate: new Date(),
                        paidAt: new Date()
                    },
                    { 
                        companyId, 
                        description: 'FORNECIMENTO DE EQUIPAMENTO IT', 
                        amount: 1200000, 
                        type: 'PAYABLE', 
                        category: 'INVESTMENT', 
                        status: 'PENDING',
                        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                    }
                ]
            });

            // 10. Create Budget Lines
            await prisma.budgetLine.createMany({
                data: [
                    { companyId, department: 'Comercial', category: 'Publicidade e Marketing', planned: 5000000, actual: 1200000, variance: 3800000, period: `${new Date().getFullYear()}-Q1`, status: 'UNDER_BUDGET' },
                    { companyId, department: 'RH', category: 'Formação Técnica', planned: 1500000, actual: 1650000, variance: -150000, period: `${new Date().getFullYear()}-Q1`, status: 'OVER_BUDGET' },
                    { companyId, department: 'TI', category: 'Serviços em Nuvem / Cloud', planned: 2000000, actual: 1950000, variance: 50000, period: `${new Date().getFullYear()}-Q1`, status: 'ON_TRACK' },
                    { companyId, department: 'Operações', category: 'Manutenção de Instalações', planned: 3000000, actual: 2800000, variance: 200000, period: `${new Date().getFullYear()}-Q1`, status: 'ON_TRACK' },
                ]
            });

            // 11. Create Training Courses & Lessons
            const course = await prisma.trainingCourse.create({
                data: {
                    companyId,
                    title: 'LIDERANÇA E ALTA PERFORMANCE VA',
                    category: 'MANAGEMENT',
                    description: 'Protocolo avançado de gestão de equipas e excelência operacional.',
                    instructor: 'Expert VA OneGest',
                    duration: '4h',
                    status: 'ACTIVE',
                    rating: 5.0,
                    enrolled: 124
                }
            });

            // 12. Create Legal Contracts
            await prisma.contract.createMany({
                data: [
                    { companyId, title: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS TI', entity: 'JFTECH ANGOLA', value: 2500000, expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) },
                    { companyId, title: 'PROTOCOLO DE SEGURANÇA PATRIMONIAL', entity: 'PROSEGUR', value: 450000, expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },
                    { companyId, title: 'ALUGUER DE ESCRITÓRIOS LUANDA', entity: 'IMO-CENTRO', value: 1200000, expiryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }, // Expired
                ]
            });

            // 13. Create HSE Incidents
            await prisma.hSEIncident.createMany({
                data: [
                    { companyId, title: 'QUEDA DE CARGA NO TERMINAL B', type: 'Acidente Operacional', location: 'Terminal Luanda', level: 'MEDIUM', reporter: 'AGENTE-01', date: new Date(), status: 'OPEN', description: 'Carga de cimento deslizou durante a descarga.' },
                    { companyId, title: 'PICO DE CO2 EM ARMAZÉM FRIO', type: 'Ambiental', location: 'Câmara Fria 02', level: 'HIGH', reporter: 'SENSOR-AUTO', date: new Date(Date.now() - 86400000), status: 'RESOLVED', description: 'Aumento súbito detectado pelo sensor infravermelho.' },
                ]
            });

            res.json({ message: 'Matriz de dados de demonstração inicializada com sucesso.' });
        } catch (error) {
            console.error('[SetupDemoData]', error);
            res.status(500).json({ error: 'Erro ao inicializar dados de demonstração' });
        }
    }

    // UPDATE COMPANY PROFILE (Logo, Address, NIF, etc)
    static async updateCompanyProfile(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { name, nif, address, phone, email, logo } = req.body;

            const updated = await prisma.company.update({
                where: { id: companyId },
                data: {
                    name,
                    nif,
                    address,
                    phone,
                    email,
                    logo // Base64 or URL
                }
            });

            res.json({ message: 'Perfil da empresa actualizado com sucesso', company: updated });
        } catch (error) {
            console.error('[UpdateCompanyProfile]', error);
            res.status(500).json({ error: 'Erro ao actualizar perfil da empresa' });
        }
    }
}

