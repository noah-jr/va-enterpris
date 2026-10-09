import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getPermissionsByModules } from '../config/modulePermissions';
import prisma from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_for_mvp';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_refresh_secret_mvp';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    companyId: string;
    name: string;
    email: string;
    password: string;
    role?: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        companyId: string;
    };
}

export class AuthService {
    static generateAccessToken(payload: object): string {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    }

    static generateRefreshToken(payload: object): string {
        return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    }

    static verifyRefreshToken(token: string): any {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    }

    static async login({ email, password }: LoginPayload): Promise<TokenPair> {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                company: true,
                roleData: {
                    include: {
                        permissions: true
                    }
                }
            }

        });

        if (!user || !user.isActive) {
            throw new Error('Credenciais inválidas ou conta inativa.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Credenciais inválidas.');
        }

        const permissions = user.roleData?.permissions.map(p => p.name) || [];

        const jwtPayload = {
            userId: user.id,
            id: user.id,
            companyId: user.companyId,
            role: user.role, // Keep for legacy compatibility
            roleId: user.roleId,
            permissions, // Optional: add to token if small enough
            email: user.email,
        };

        const accessToken = this.generateAccessToken(jwtPayload);
        const refreshToken = this.generateRefreshToken({ userId: user.id });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
                permissions: permissions as any,
                company: {
                    name: (user as any).company?.name,
                    nif: (user as any).company?.nif,
                    enabledModules: (user as any).company?.enabledModules || []
                }
            } as any,
        };

    }

    static async register({ companyId, name, email, password, role }: RegisterPayload): Promise<TokenPair> {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new Error('Este email já está em uso.');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                companyId,
                name,
                email,
                password: hashedPassword,
                role: role || 'USER',
            },
        });

        const jwtPayload = {
            userId: user.id,
            id: user.id, // For compatibility with middlewares expecting user.id
            companyId: user.companyId,
            role: user.role,
            roleId: user.roleId,
            email: user.email,
        };

        const accessToken = this.generateAccessToken(jwtPayload);
        const refreshToken = this.generateRefreshToken({ userId: user.id });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
            },
        };
    }

    static async refreshToken(token: string): Promise<{ accessToken: string }> {
        let decoded: any;
        try {
            decoded = this.verifyRefreshToken(token);
        } catch {
            throw new Error('Refresh token inválido ou expirado.');
        }

        // Incluir permissões no token renovado para evitar queries à DB
        // no rbacMiddleware a cada request autenticado
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                roleData: { include: { permissions: true } }
            }
        });
        if (!user || !user.isActive) {
            throw new Error('Utilizador não encontrado ou inativo.');
        }

        const permissions = user.roleData?.permissions.map(p => p.name) || [];

        const jwtPayload = {
            userId: user.id,
            id: user.id,
            companyId: user.companyId,
            role: user.role,
            roleId: user.roleId,
            email: user.email,
            permissions, // embebido para evitar DB hits no RBAC
        };

        const accessToken = this.generateAccessToken(jwtPayload);
        return { accessToken };
    }

    static async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                companyId: true,
                isActive: true,
                twoFactorEnabled: true,
                createdAt: true,
                roleData: {
                    select: { permissions: { select: { name: true } } }
                },
                company: { 
                    select: { 
                        name: true, 
                        nif: true, 
                        enabledModules: true,
                        status: true,
                        expiresAt: true
                    } as any
                }
            }
        }) as any;

        if (!user) throw new Error('Utilizador não encontrado.');

        // Check for active subscription
        let hasActiveSubscription = false;
        let subscriptionExpiry = null;

        if (user.companyId) {
            const sub = await prisma.subscription.findFirst({
                where: {
                    companyId: user.companyId,
                    status: 'ACTIVE',
                    endDate: { gte: new Date() }
                },
                orderBy: { endDate: 'desc' }
            });
            if (sub) {
                hasActiveSubscription = true;
                subscriptionExpiry = sub.endDate;
            }
        }

        let permissions = user.roleData?.permissions?.map((p: any) => p.name) || [];

        // Implicit SaaS Permissions:
        // Se for ADMIN ou MANAGER de uma empresa com módulos ativos, herda as permissões desses módulos automaticamente.
        if (user.role === 'ADMIN' || user.role === 'MANAGER') {
            const modulePerms = getPermissionsByModules(user.company?.enabledModules || []);
            const combined = new Set([...permissions, ...modulePerms]);
            permissions = Array.from(combined);
        }

        return {
            ...user,
            permissions,
            hasActiveSubscription,
            subscriptionExpiry
        };
    }
}

