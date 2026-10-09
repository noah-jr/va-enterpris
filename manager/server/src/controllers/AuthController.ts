import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { AuditService } from '../services/AuditService';
import { PLANS } from '../config/plans';
import { EmailService } from '../services/EmailService';

export class AuthController {
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            const { accessToken, refreshToken, user } = await AuthService.login({ email, password });

            // Send refresh token as HttpOnly cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({ message: 'Login com sucesso', user, accessToken });

            // Audit login
            if (user.companyId) {
                AuditService.log({
                    companyId: user.companyId,
                    userId: user.id,
                    action: 'USER_LOGIN',
                    entity: 'User',
                    entityId: user.id,
                    details: 'Utilizador autenticado no sistema',
                    ipAddress: req.ip
                });
            }
        } catch (error: any) {
            res.status(401).json({ error: error.message || 'Login falhou' });
        }
    }

    static async registerSaaS(req: Request, res: Response) {
        try {
            // Check if registration is hidden/disabled
            const hideRegSetting = await prisma.systemSetting.findUnique({
                where: { key: 'HIDE_REGISTRATION' }
            });
            if (hideRegSetting?.value === 'true') {
                return res.status(403).json({ error: 'O registo público de contas encontra-se desativado.' });
            }

            const { companyName, companyNif, companyPhone, companyAddress, userName, userEmail, password } = req.body;
            // Always use TRIAL plan on registration - plan selection happens after trial
            const plan = 'TRIAL';

            if (!companyName || !companyNif || !userName || !userEmail || !password) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
            }

            const planDef = PLANS[plan as keyof typeof PLANS] || PLANS.STARTER;
            const selectedModules = planDef.modules;

            // Check if user already exists
            const existingUser = await prisma.user.findUnique({ where: { email: userEmail } });
            if (existingUser) {
                return res.status(400).json({ error: 'Este email já está em uso.' });
            }

            // Check if company NIF exists
            const existingCompany = await prisma.company.findUnique({ where: { nif: companyNif } });
            if (existingCompany) {
                return res.status(400).json({ error: 'Esta empresa (NIF) já está registada.' });
            }

            // Procurar o plano TRIAL na base de dados para ligar a subscrição correctamente
            // Isto permite rastrear o trial no sistema de gestão de subscrições
            const dbTrialPlan = await prisma.subscriptionPlan.findFirst({
                where: { name: { contains: 'Trial', mode: 'insensitive' }, isActive: true }
            });

            // Transaction to create Company and Admin User
            const { user, company, otpCode } = await prisma.$transaction(async (tx) => {
                const company = await tx.company.create({
                    data: {
                        name: companyName,
                        nif: companyNif,
                        phone: companyPhone,
                        address: companyAddress,
                        email: userEmail,
                        status: 'ACTIVE', // Activate company so they can use the trial immediately
                        enabledModules: selectedModules
                    }
                });

                const hashedPassword = await bcrypt.hash(password, 12);

                // Link to global ADMIN role to ensure permissions
                const globalAdminRole = await tx.role.findFirst({
                    where: { companyId: null, name: 'ADMIN' }
                });

                const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

                const adminUser = await tx.user.create({
                    data: {
                        companyId: company.id,
                        name: userName,
                        email: userEmail,
                        password: hashedPassword,
                        role: 'ADMIN',
                        roleId: globalAdminRole?.id,
                        isActive: false, // Espera por verificação de email
                        verificationToken: otpCode
                    }
                });

                // Criar subscrição de trial de 14 dias
                // Se existir plano TRIAL na DB, liga pelo planId (UUID) para rastreabilidade
                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(startDate.getDate() + 14);

                await tx.subscription.create({
                    data: {
                        companyId: company.id,
                        plan:      dbTrialPlan ? dbTrialPlan.id : plan, // UUID do plano da DB ou fallback 'TRIAL'
                        billing:   'MONTHLY',
                        status:    'ACTIVE',
                        startDate,
                        endDate,
                        price:     0
                    }
                });

                return { user: adminUser, company, otpCode };
            }, { timeout: 10000 });

            // Enviar email de verificação com OTP
            await EmailService.sendVerificationOTP(userEmail, userName, otpCode);

            res.status(201).json({
                message: `Conta criada com sucesso! Verifique o seu email para ativar a conta.`,
                requiresVerification: true,
                email: userEmail
            });

            // Audit Registration
            AuditService.log({
                companyId: user.companyId!,
                userId: user.id,
                action: 'SaaS_REGISTER',
                entity: 'Company',
                entityId: user.companyId!,
                details: `Nova empresa registada: ${companyName} com plano ${plan}`
            });

        } catch (error: any) {
            console.error(error);
            res.status(500).json({ error: 'Falha ao criar conta SaaS. Tente novamente.' });
        }
    }

    static async refresh(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: 'Nenhum refresh token fornecido' });
            }

            const { accessToken } = await AuthService.refreshToken(refreshToken);
            res.json({ accessToken });
        } catch (error: any) {
            res.status(401).json({ error: error.message || 'Refresh falhou' });
        }
    }

    static async logout(req: Request, res: Response) {
        res.clearCookie('refreshToken');
        res.json({ message: 'Sessão terminada.' });
    }

    static async me(req: Request, res: Response) {
        try {
            if (!req.user || !req.user.userId) {
                return res.status(401).json({ error: 'Sessão inválida ou expirada' });
            }
            const userId = req.user.userId;
            const profile = await AuthService.getProfile(userId);
            res.json(profile);
        } catch (error: any) {
            console.error('[Auth me Error]', error, req.user);
            res.status(500).json({ error: 'Erro ao obter perfil do utilizador.' });
        }
    }

    static async getPlans(_req: Request, res: Response) {
        try {
            const dbPlans = await prisma.subscriptionPlan.findMany({
                orderBy: { price: 'asc' }
            });
            res.json(dbPlans);
        } catch (error) {
            console.error('[GetPlans Auth]', error);
            res.status(500).json({ error: 'Erro ao buscar planos' });
        }
    }

    static async getPublicStats(req: Request, res: Response) {
        try {
            const [companiesCount, invoicesCount] = await Promise.all([
                prisma.company.count({ where: { status: 'ACTIVE' } }),
                prisma.invoice.count()
            ]);
            
            res.json({
                companies: companiesCount,
                invoices: invoicesCount,
                uptime: '99.9%'
            });
        } catch (error) {
            console.error('[PublicStats Error]', error);
            res.status(500).json({ error: 'Erro ao obter estatísticas públicas' });
        }
    }

    static async verifyEmail(req: Request, res: Response) {
        try {
            const { email, code } = req.body;
            if (!email || !code) {
                return res.status(400).json({ error: 'Email e código são obrigatórios' });
            }

            // Carregar utilizador com permissões para incluir no JWT (evita DB hits no RBAC)
            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    roleData: { include: { permissions: true } }
                }
            });
            if (!user) {
                return res.status(404).json({ error: 'Utilizador não encontrado' });
            }

            if (user.isActive) {
                return res.status(400).json({ error: 'Conta já está ativa' });
            }

            if (user.verificationToken !== code) {
                return res.status(400).json({ error: 'Código de verificação inválido' });
            }

            // Ativar utilizador
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    isActive: true,
                    verificationToken: null
                }
            });

            const permissions = user.roleData?.permissions.map(p => p.name) || [];

            // Gerar token para login automático após verificação (com permissões embebidas)
            const jwtPayload = {
                userId: user.id,
                id: user.id,
                companyId: user.companyId,
                role: user.role,
                roleId: user.roleId,
                email: user.email,
                permissions,
            };

            const accessToken = AuthService.generateAccessToken(jwtPayload);
            const refreshToken = AuthService.generateRefreshToken({ userId: user.id });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({ message: 'Conta verificada com sucesso!', accessToken });
        } catch (error: any) {
            console.error('[Verify Email]', error);
            res.status(500).json({ error: 'Falha ao verificar email' });
        }
    }

    static async resendOTP(req: Request, res: Response) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ error: 'Email é obrigatório' });
            }

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(404).json({ error: 'Utilizador não encontrado' });
            }

            if (user.isActive) {
                return res.status(400).json({ error: 'A conta já está ativa' });
            }

            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            await prisma.user.update({
                where: { id: user.id },
                data: { verificationToken: otpCode }
            });

            await EmailService.sendVerificationOTP(user.email, user.name, otpCode);

            res.json({ message: 'Novo código de verificação enviado com sucesso.' });
        } catch (error: any) {
            console.error('[Resend OTP]', error);
            res.status(500).json({ error: 'Falha ao reenviar código' });
        }
    }
}
