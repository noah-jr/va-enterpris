import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class StrategyController {
    static async getObjectives(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const objectives = await prisma.strategicObjective.findMany({
                where: { companyId },
                include: { keyResults: true },
                orderBy: { createdAt: 'desc' }
            });
            res.json(objectives);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch objectives' });
        }
    }

    static async createObjective(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { title, description, startDate, endDate, keyResults } = req.body;

            const objective = await prisma.strategicObjective.create({
                data: {
                    companyId,
                    title,
                    description,
                    startDate: startDate ? new Date(startDate) : new Date(),
                    endDate: endDate ? new Date(endDate) : new Date(),
                    keyResults: {
                        create: keyResults || []
                    }
                },
                include: { keyResults: true }
            });
            res.json(objective);
        } catch (error) {
            console.error('[Strategy Error]', error);
            res.status(500).json({ error: 'Failed to create objective' });
        }
    }

    static async updateObjective(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const { title, description, status, progress } = req.body;

            const objective = await prisma.strategicObjective.update({
                where: { id },
                data: { title, description, status, progress }
            });
            res.json(objective);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update objective' });
        }
    }

    static async deleteObjective(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            await prisma.keyResult.deleteMany({ where: { objectiveId: id } });
            await prisma.strategicObjective.delete({ where: { id } });
            res.json({ message: 'Objective deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete objective' });
        }
    }
}
