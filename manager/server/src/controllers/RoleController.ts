import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuditService } from '../services/AuditService';


export class RolesController {
    // ─── ROLES ───────────────────────────────────────────────────────────
    static async getRoles(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const roles = await prisma.role.findMany({
                where: {
                    OR: [
                        { companyId: null }, // Global roles
                        { companyId }        // Custom company roles
                    ]
                },
                include: {
                    permissions: true,
                    _count: {
                        select: { users: true }
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            });

            res.json(roles);
        } catch (error) {
            console.error('[GetRoles Error]:', error);
            res.status(500).json({ error: 'Erro ao listar perfis de acesso' });
        }
    }

    static async createRole(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { name, description, permissionIds } = req.body;

            if (!name) {
                return res.status(400).json({ error: 'Nome do perfil obrigatório' });
            }

            // check if role exists for this company
            const existing = await prisma.role.findFirst({
                where: { companyId, name }
            });

            if (existing) {
                return res.status(400).json({ error: 'Já existe um perfil com este nome' });
            }

            const role = await prisma.role.create({
                data: {
                    companyId,
                    name,
                    description,
                    permissions: {
                        connect: (permissionIds || []).map((id: string) => ({ id }))
                    }
                },
                include: { permissions: true }
            });

            await AuditService.log({
                companyId: companyId as string,
                userId: (req.user as any)?.id,
                action: 'CREATE_ROLE',
                entity: 'ROLE',
                entityId: role.id,
                details: `Perfil de acesso '${name}' criado com ${permissionIds?.length || 0} permissões`
            });

            res.status(201).json(role);
        } catch (error) {
            console.error('[CreateRole Error]:', error);
            res.status(500).json({ error: 'Erro ao criar perfil' });
        }
    }

    static async updateRole(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            const id = req.params.id as string;
            const { name, description, permissionIds } = req.body;

            const existingRole = await prisma.role.findUnique({ where: { id } });

            if (!existingRole) {
                return res.status(404).json({ error: 'Perfil não encontrado' });
            }

            // Cannot edit global roles unless Super Admin directly accesses db
            if (existingRole.companyId === null) {
                return res.status(403).json({ error: 'Não é possível modificar perfis nativos do sistema' });
            }

            if (existingRole.companyId !== companyId) {
                return res.status(403).json({ error: 'Acesso não autorizado a este perfil' });
            }

            const updatedRole = await prisma.role.update({
                where: { id },
                data: {
                    name,
                    description,
                    permissions: {
                        set: [], // clears existing connections
                        connect: (permissionIds || []).map((pId: string) => ({ id: pId }))
                    }
                },
                include: { permissions: true }
            });

            await AuditService.log({
                companyId: companyId as string,
                userId: (req.user as any)?.id,
                action: 'UPDATE_ROLE',
                entity: 'ROLE',
                entityId: id,
                details: `Perfil de acesso '${name}' atualizado`
            });

            res.json(updatedRole);
        } catch (error) {
            console.error('[UpdateRole Error]:', error);
            res.status(500).json({ error: 'Erro ao atualizar perfil' });
        }
    }

    static async deleteRole(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            const id = req.params.id as string;

            const existingRole = await prisma.role.findUnique({
                where: { id },
                include: { _count: { select: { users: true } } }
            });

            if (!existingRole) return res.status(404).json({ error: 'Perfil não encontrado' });

            if (existingRole.companyId === null) {
                return res.status(403).json({ error: 'Não é possível remover perfis nativos do sistema' });
            }

            if (existingRole.companyId !== companyId) {
                return res.status(403).json({ error: 'Acesso não autorizado' });
            }

            if (existingRole && (existingRole as any)._count.users > 0) {
                return res.status(400).json({ error: 'Existem utilizadores a partilhar este perfil. Reatribua-os antes de apagar.' });
            }

            await prisma.role.delete({ where: { id } });

            await AuditService.log({
                companyId: companyId as string,
                userId: (req.user as any)?.id,
                action: 'DELETE_ROLE',
                entity: 'ROLE',
                entityId: id,
                details: `Perfil de acesso '${existingRole.name}' eliminado`
            });

            res.json({ message: 'Perfil removido com sucesso' });
        } catch (error) {
            console.error('[DeleteRole Error]:', error);
            res.status(500).json({ error: 'Erro ao apagar perfil' });
        }
    }

    // ─── PERMISSIONS ─────────────────────────────────────────────────────
    static async getPermissions(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const company = await prisma.company.findUnique({
                where: { id: companyId },
                select: { enabledModules: true }
            });

            if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });

            const enabledModules = company.enabledModules || [];

            // Mapping of modules to permission prefixes
            const MODULE_PERMISSIONS_MAPPING: Record<string, string[]> = {
                'invoices': ['invoices:'],
                'clients': ['clients:'],
                'products': ['products:'],
                'inventory': ['products:', 'suppliers:'],
                'suppliers': ['suppliers:'],
                'hr': ['hr:', 'payroll:', 'recruitment:', 'training:'],
                'payroll': ['payroll:'],
                'finance': ['finance:', 'accounting:', 'treasury:', 'budget:'],
                'accounting': ['accounting:'],
                'treasury': ['treasury:'],
                'budget': ['budget:'],
                'crm': ['crm:', 'marketing:'],
                'projects': ['projects:'],
                'training': ['training:'],
                'pos': ['pos:'],
                'logistics': ['logistics:', 'fleet:'],
                'fleet': ['fleet:'],
                'hse': ['hse:'],
                'quality': ['quality:'],
                'assets': ['assets:'],
                'production': ['production:'],
                'marketing': ['marketing:'],
                'legal': ['legal:'],
                'strategy': ['strategy:', 'kpis:', 'expansion:', 'risks:'],
                'analytics': ['reports:'],
                'reports': ['reports:'],
                'documents': ['documents:'],
                'communications': ['communications:'],
                'calendar': ['calendar:'],
                'approvals': ['approvals:'],
                'settings': ['admin:'],
                'dashboard': ['dashboard:']
            };

            const allowedPrefixes = new Set<string>();
            enabledModules.forEach(mod => {
                if (MODULE_PERMISSIONS_MAPPING[mod]) {
                    MODULE_PERMISSIONS_MAPPING[mod].forEach(prefix => allowedPrefixes.add(prefix));
                }
            });

            // Always allow admin:access for those who have access to this controller? 
            // Actually, we filter what the user can assign.
            
            const permissions = await prisma.permission.findMany({
                orderBy: { name: 'asc' }
            });

            // Se não houver módulos limitadores definidos, assumimos que tem acesso a tudo (ex: Enterprise/Trial não mapeado)
            if (allowedPrefixes.size === 0) {
                return res.json(permissions);
            }

            // Filter permissions based on allowed prefixes
            const filteredPermissions = permissions.filter(p => {
                // If it's a super admin, they might see all, but here we filter for the company
                return Array.from(allowedPrefixes).some(prefix => p.name.startsWith(prefix));
            });

            res.json(filteredPermissions);
        } catch (error) {
            console.error('[GetPermissions Error]:', error);
            res.status(500).json({ error: 'Erro ao listar permissões granulares' });
        }
    }
}
