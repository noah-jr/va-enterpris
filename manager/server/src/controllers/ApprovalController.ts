import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class ApprovalController {
    static async getRequests(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            const requests = await prisma.approvalRequest.findMany({
                where: { companyId },
                include: { steps: { orderBy: { order: 'asc' } } },
                orderBy: { createdAt: 'desc' }
            });
            res.json(requests);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar pedidos de aprovação' });
        }
    }

    static async createRequest(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            const { title, type, requester, department, amount, priority, description, steps } = req.body;

            const request = await prisma.approvalRequest.create({
                data: {
                    companyId,
                    title,
                    type,
                    requester,
                    department,
                    amount: amount ? Number(amount) : null,
                    priority,
                    description,
                    steps: {
                        create: steps.map((s: any, idx: number) => ({
                            role: s.role,
                            approverName: s.name,
                            status: 'PENDING',
                            order: idx
                        }))
                    }
                },
                include: { steps: true }
            });
            res.status(201).json(request);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar pedido de aprovação' });
        }
    }

    static async updateStep(req: Request, res: Response) {
        try {
            const { stepId } = req.params;
            const { status, comment, approverName } = req.body;
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const step = await prisma.approvalStep.update({
                where: { id: stepId as string },
                data: {
                    status,
                    comment,
                    approverName,
                    decidedAt: new Date()
                },
                include: { approvalRequest: { include: { steps: true } } }
            }) as any;

            // Update request status if needed
            const allSteps = step.approvalRequest.steps as any[];
            const anyRejected = allSteps.some((s: any) => s.status === 'REJECTED');
            const allApproved = allSteps.every((s: any) => s.status === 'APPROVED');
            const anyRevision = allSteps.some((s: any) => s.status === 'REVISION');

            let newStatus = 'PENDING';
            if (anyRejected) newStatus = 'REJECTED';
            else if (anyRevision) newStatus = 'REVISION';
            else if (allApproved) newStatus = 'APPROVED';

            if (newStatus !== step.approvalRequest.status) {
                await prisma.approvalRequest.update({
                    where: { id: step.approvalRequestId as string },
                    data: { status: newStatus }
                });
            }

            res.json(step);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao processar aprovação' });
        }
    }
}
