import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class ProjectController {
    static async getProjects(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = (req.query.search as string) || '';
            const skip = (page - 1) * limit;

            const where: any = { companyId };
            if (search) {
                where.OR = [
                    { name: { contains: search } },
                    { description: { contains: search } }
                ];
            }

            const [total, projects, allActive] = await prisma.$transaction([
                prisma.project.count({ where }),
                prisma.project.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        client: { select: { name: true } },
                        tasks: true
                    },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.project.count({ where: { companyId, status: { not: 'COMPLETED' } } })
            ]);

            const aggregations = await prisma.project.aggregate({
                where: { companyId },
                _sum: { budget: true }
            });

            res.json({
                data: projects,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    kpis: {
                        activeProjects: allActive,
                        totalBudget: aggregations._sum.budget || 0
                    }
                }
            });
        } catch (error) {
            console.error('[ProjectController Error]', error);
            res.status(500).json({ error: 'Erro ao buscar projetos' });
        }
    }

    static async createProject(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            const { name, description, clientId, startDate, endDate, budget } = req.body;
            const project = await prisma.project.create({
                data: {
                    companyId,
                    name,
                    description,
                    clientId: clientId || null,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    budget: budget ? Number(budget) : undefined,
                    status: 'PLANNING'
                }
            });
            res.status(201).json(project);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar projeto' });
        }
    }

    static async updateProject(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const existing = await prisma.project.findFirst({ where: { id: id as string, companyId } });
            if (!existing) return res.status(404).json({ error: 'Projeto não encontrado' });

            const project = await prisma.project.update({
                where: { id: id as string },
                data: req.body
            });
            res.json(project);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar projeto' });
        }
    }

    static async addTask(req: Request, res: Response) {
        try {
            const projectId = req.params.id as string;
            const { title, description, priority, dueDate } = req.body;
            const task = await prisma.projectTask.create({
                data: {
                    projectId,
                    title,
                    description,
                    priority: priority || 'MEDIUM',
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    status: 'TODO'
                }
            });
            res.status(201).json(task);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar tarefa' });
        }
    }

    static async updateTask(req: Request, res: Response) {
        try {
            const { taskId } = req.params;
            const task = await prisma.projectTask.update({
                where: { id: taskId as string },
                data: req.body
            });
            res.json(task);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar tarefa' });
        }
    }

    static async deleteProject(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const existing = await prisma.project.findFirst({ where: { id: id as string, companyId } });
            if (!existing) return res.status(404).json({ error: 'Projeto não encontrado' });

            await prisma.projectTask.deleteMany({ where: { projectId: id as string } });
            await prisma.project.delete({ where: { id: id as string } });
            res.json({ message: 'Projeto eliminado' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao eliminar projeto' });
        }
    }
}
