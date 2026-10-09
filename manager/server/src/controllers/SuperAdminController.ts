import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { EmailService } from '../services/EmailService';


export class SuperAdminController {
    static async getStats(req: Request, res: Response) {
        try {
            // Check if user is SUPER_ADMIN
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') {
                // If no user, Check if it's an API Key request (which skips authMiddleware user binding but passes the check)
                // But in this case, authMiddleware was applied. If it reached here with API Key, user is undefined.
                return res.status(403).json({ error: 'Acesso negado. Apenas para Super Administradores.' });
            }

            const [totalCompanies, totalUsers, totalInvoices, totalRevenue] = await Promise.all([
                prisma.company.count(),
                prisma.user.count(),
                prisma.invoice.count(),
                prisma.invoice.aggregate({
                    _sum: { totalAmount: true },
                    where: { status: 'PAID' }
                })
            ]);

            const activeSubscriptions = await prisma.subscription.count({
                where: { status: 'ACTIVE' }
            });

            const recentCompanies = await prisma.company.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { users: true }
                    }
                }
            });

            res.json({
                stats: {
                    totalCompanies,
                    totalUsers,
                    totalInvoices,
                    totalRevenue: totalRevenue._sum.totalAmount || 0,
                    activeSubscriptions
                },
                recentCompanies: recentCompanies.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    nif: c.nif,
                    status: c.status || 'ACTIVE',
                    userCount: c._count.users,
                    createdAt: c.createdAt
                }))
            });
        } catch (error) {
            console.error('[SuperAdmin Stats Error]', error);
            res.status(500).json({ error: 'Erro ao carregar estatísticas do Super Admin' });
        }
    }

    static async getAllCompanies(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const companies = await prisma.company.findMany({
                include: {
                    _count: { select: { users: true } },
                    subscriptions: {
                        orderBy: { endDate: 'desc' }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.json(companies);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar empresas' });
        }
    }

    static async createCompany(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Acesso negado.' });

            const { name, nif, email, phone, address, plan, enabledModules, expiresAt } = req.body;

            const existing = await prisma.company.findUnique({ where: { nif } });
            if (existing) return res.status(400).json({ error: 'Já existe uma empresa com este NIF.' });

            const company = await prisma.company.create({
                data: {
                    name,
                    nif,
                    email,
                    phone,
                    address,
                    status: 'ACTIVE',
                    enabledModules: enabledModules || [],
                    expiresAt: expiresAt ? new Date(expiresAt) : null
                } as any
            });

            // Create initial subscription if plan is provided
            if (plan) {
                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + 1); // 1 month trial or initial

                await prisma.subscription.create({
                    data: {
                        companyId: company.id,
                        plan,
                        status: 'ACTIVE',
                        startDate: new Date(),
                        endDate,
                        price: 0
                    }
                });
            }

            res.status(201).json(company);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar empresa' });
        }
    }

    static async extendCompanyExpiration(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Acesso negado.' });

            const { id } = req.params;
            const { expiresAt } = req.body;

            if (!expiresAt) return res.status(400).json({ error: 'Data de expiração é obrigatória.' });

            const company = await prisma.company.update({
                where: { id: id as string },
                data: { expiresAt: new Date(expiresAt) } as any
            });

            res.json(company);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao prorrogar conta.' });
        }
    }

    static async deleteCompany(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Acesso negado.' });

            const id = req.params.id as string;

            // Delete in transaction to handle relations
            await prisma.$transaction([
                prisma.subscription.deleteMany({ where: { companyId: id } }),
                prisma.user.deleteMany({ where: { companyId: id } }),
                prisma.company.delete({ where: { id } })
            ]);

            res.json({ message: 'Empresa e dados associados eliminados com sucesso.' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao eliminar empresa. Verifique se existem registos dependentes complexos.' });
        }
    }

    static async getAllUsers(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Acesso negado.' });

            const users = await prisma.user.findMany({
                include: {
                    company: { select: { name: true } }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.json(users);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar utilizadores' });
        }
    }

    static async createUser(req: Request, res: Response) {
        try {
            const admin = (req as any).user;
            if (!admin || admin.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Acesso negado.' });

            const { name, email, password, role, companyId } = req.body;
            
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) return res.status(400).json({ error: 'Email já registado.' });

            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash(password, 12);

            let actualCompanyId = companyId;
            
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role,
                    companyId: actualCompanyId || admin.companyId, 
                    isActive: false,
                    verificationToken: otpCode
                }
            });
            
            try {
                await EmailService.sendVerificationOTP(email, name, otpCode);
            } catch (emailErr) {
                console.error('[createUser] Falha ao enviar OTP:', emailErr);
            }

            res.status(201).json({ user: newUser, message: 'Utilizador criado. E-mail de verificação enviado.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao provisionar acesso para utilizador.' });
        }
    }

    static async deleteUser(req: Request, res: Response) {
        try {
            const admin = (req as any).user;
            if (!admin || admin.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Acesso negado.' });

            const id = req.params.id as string;

            // Prevent self-deletion
            if (id === admin.userId) {
                return res.status(400).json({ error: 'Não pode eliminar a sua própria conta de administrador.' });
            }

            await prisma.user.delete({ where: { id } });
            res.json({ message: 'Utilizador eliminado com sucesso.' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao eliminar utilizador.' });
        }
    }

    static async updateUserRole(req: Request, res: Response) {
        try {
            const admin = (req as any).user;
            if (!admin || admin.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Acesso negado.' });

            const id = req.params.id as string;
            const { role } = req.body;

            if (!['ADMIN', 'MANAGER', 'USER', 'SUPER_ADMIN'].includes(role)) {
                return res.status(400).json({ error: 'Cargo inválido.' });
            }

            await prisma.user.update({
                where: { id },
                data: { role }
            });

            res.json({ message: 'Cargo do utilizador actualizado com sucesso.' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao actualizar cargo do utilizador.' });
        }
    }

    static async manageSubscription(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const { companyId, plan, endDate, status } = req.body;
            const subId = req.params.id as string | undefined;

            let subscription;
            if (subId) {
                subscription = await prisma.subscription.update({
                    where: { id: subId },
                    data: {
                        plan,
                        endDate: new Date(endDate),
                        status
                    }
                });
            } else {
                subscription = await prisma.subscription.create({
                    data: {
                        companyId,
                        plan,
                        startDate: new Date(),
                        endDate: new Date(endDate),
                        status: status || 'ACTIVE',
                        price: 0
                    }
                });
            }

            res.json(subscription);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao gerir subscrição' });
        }
    }

    static async getCompanyDetails(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const id = req.params.id as string;
            const company = await prisma.company.findUnique({
                where: { id },
                include: {
                    subscriptions: { orderBy: { endDate: 'desc' }, take: 1 },
                    _count: { select: { users: true } }
                }
            });

            if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });
            res.json(company);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao carregar empresa' });
        }
    }

    static async updateCompanyModules(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const id = req.params.id as string;
            const { enabledModules } = req.body;

            if (!Array.isArray(enabledModules)) {
                return res.status(400).json({ error: 'enabledModules deve ser um array de strings' });
            }

            const updated = await prisma.company.update({
                where: { id },
                data: { enabledModules }
            });

            res.json({ message: 'Módulos actualizados com sucesso', enabledModules: updated.enabledModules });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao actualizar módulos' });
        }
    }

    static async approveCompany(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Acesso negado.' });

            const { id } = req.params as { id: string };
            const { status } = req.body as { status: string };

            const targetStatus = typeof status === 'string' ? status : 'ACTIVE';

            const company = await prisma.company.update({
                where: { id },
                data: { status: targetStatus }
            });

            res.json({ message: `Empresa ${targetStatus === 'ACTIVE' ? 'aprovada' : 'rejeitada'} com sucesso.`, company });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao processar aprovação da empresa' });
        }
    }

    static async toggleCompanyStatus(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Acesso negado.' });

            const { id } = req.params as { id: string };

            const current = await prisma.company.findUnique({ where: { id } });
            if (!current) return res.status(404).json({ error: 'Empresa não encontrada' });

            const newStatus = current.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';

            const updated = await prisma.company.update({
                where: { id },
                data: { status: newStatus }
            });

            res.json({ message: `Empresa ${newStatus === 'BLOCKED' ? 'bloqueada' : 'desbloqueada'} com sucesso.`, status: newStatus });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao alterar estado da empresa' });
        }
    }

    static async getPaymentMethods(req: Request, res: Response) {
        try {
            const methods = await prisma.paymentMethod.findMany();
            res.json(methods);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar métodos de pagamento' });
        }
    }

    static async createPaymentMethod(req: Request, res: Response) {
        try {
            const { name, type, details } = req.body as { name: string, type: string, details: string };
            const method = await prisma.paymentMethod.create({
                data: { name, type, details }
            });
            res.status(201).json(method);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar método de pagamento' });
        }
    }

    static async togglePaymentMethod(req: Request, res: Response) {
        try {
            const { id } = req.params as { id: string };
            const current = await prisma.paymentMethod.findUnique({ where: { id } });
            if (!current) return res.status(404).json({ error: 'Não encontrado' });

            const updated = await prisma.paymentMethod.update({
                where: { id },
                data: { isActive: !current.isActive }
            });
            res.json(updated);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao alterar estado do pagamento' });
        }
    }

    static async cancelSubscription(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Acesso negado.' });

            const id = req.params.id as string; // Subscription ID


            const sub = await prisma.subscription.findUnique({ where: { id } });
            if (!sub) return res.status(404).json({ error: 'Subscrição não encontrada.' });

            await prisma.subscription.update({
                where: { id },
                data: { status: 'CANCELLED', endDate: new Date() }
            });

            res.json({ message: 'Subscrição cancelada administrativamente com sucesso.' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao cancelar subscrição via SuperAdmin' });
        }
    }

    // ── Central Accounting Audits ─────────────────────────────────────────────

    static async listAudits(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Acesso negado.' });

            const cases = await prisma.accountingCase.findMany({
                where: {
                    status: { not: 'PENDING_SUBMISSION' }
                },
                include: {
                    company: { select: { name: true } }
                },
                orderBy: { submittedAt: 'desc' }
            });

            const mapped = cases.map(c => {
                let status = 'PENDING';
                if (['REVIEWED', 'CLOSED'].includes(c.status)) status = 'APPROVED';
                else if (c.status === 'REJECTED') status = 'REJECTED';

                return {
                    id: c.id,
                    company: { name: c.company.name },
                    type: 'DOSSIER', // Abstracted as the entire dossier
                    documentUrl: '#', // In reality, SuperAdmin would download the .tar.gz or view documents inside
                    submittedAt: c.submittedAt || c.createdAt,
                    status,
                    period: c.period,
                    adminNote: c.adminNote
                };
            });

            res.json(mapped);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar auditorias' });
        }
    }

    static async approveAudit(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Acesso negado.' });

            const id = req.params.id as string;
            const { note } = req.body;

            const updated = await prisma.accountingCase.update({
                where: { id },
                data: {
                    status: 'REVIEWED',
                    adminNote: note,
                    reviewedBy: user.userId || user.id,
                    reviewedAt: new Date()
                }
            });

            res.json(updated);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao aprovar auditoria' });
        }
    }

    static async rejectAudit(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Acesso negado.' });

            const id = req.params.id as string;
            const { note } = req.body;

            const updated = await prisma.accountingCase.update({
                where: { id },
                data: {
                    status: 'REJECTED',
                    adminNote: note,
                    reviewedBy: user.userId || user.id,
                    reviewedAt: new Date()
                }
            });

            res.json(updated);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao rejeitar auditoria' });
        }
    }

    // ── Roles & Permissions ────────────────────────────────────────────────
    static async getRoles(req: Request, res: Response) {
        try {
            const roles = await prisma.role.findMany({
                where: { companyId: null }, // System roles only
                include: { permissions: true, _count: { select: { users: true } } },
                orderBy: { name: 'asc' }
            });
            res.json(roles);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar perfis de sistema' });
        }
    }
    
    static async createRole(req: Request, res: Response) {
        try {
            const { name, description, permissionIds } = req.body;
            const role = await prisma.role.create({
                data: {
                    name, description, companyId: null,
                    permissions: { connect: (permissionIds || []).map((id: string) => ({ id })) }
                },
                include: { permissions: true }
            });
            res.status(201).json(role);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar perfil de sistema' });
        }
    }

    static async updateRole(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { name, description, permissionIds } = req.body;
            const updated = await prisma.role.update({
                where: { id },
                data: {
                    name, description,
                    permissions: { set: [], connect: (permissionIds || []).map((pId: string) => ({ id: pId })) }
                },
                include: { permissions: true }
            });
            res.json(updated);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar perfil' });
        }
    }

    static async deleteRole(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            await prisma.role.delete({ where: { id } });
            res.json({ message: 'Perfil removido' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao apagar perfil' });
        }
    }

    static async getPermissions(req: Request, res: Response) {
        try {
            const permissions = await prisma.permission.findMany({ orderBy: { name: 'asc' } });
            res.json(permissions);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar permissões' });
        }
    }
}
