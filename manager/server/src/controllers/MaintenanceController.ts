import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export class MaintenanceController {
    static async getMaintenance(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

            // Find all maintenance records for assets belonging to this company
            const records = await prisma.maintenanceRecord.findMany({
                where: {
                    asset: {
                        companyId
                    }
                },
                include: {
                    asset: true
                },
                orderBy: {
                    date: 'desc'
                }
            });

            // Map fields to match frontend expectations (title, etc)
            const mapped = records.map(r => ({
                id: r.id,
                title: r.description.split('\n')[0].substring(0, 50) || `Intervenção em ${r.asset.name}`,
                description: r.description,
                status: r.status,
                priority: (r as any).priority || 'MEDIUM', // Add priority if it exists in DB or default
                cost: r.cost,
                createdAt: r.date,
                asset: r.asset
            }));

            res.json(mapped);
        } catch (error) {
            console.error('[MaintenanceController] Error:', error);
            res.status(500).json({ error: 'Failed to fetch maintenance records' });
        }
    }

    static async createMaintenance(req: Request, res: Response) {
        try {
            const { assetId, title, description, cost, priority, status } = req.body;
            
            const record = await prisma.maintenanceRecord.create({
                data: {
                    assetId,
                    description: `${title}\n${description}`,
                    cost: Number(cost) || 0,
                    status: status || 'PENDING',
                    date: new Date()
                },
                include: {
                    asset: true
                }
            });

            res.status(201).json(record);
        } catch (error) {
            console.error('[MaintenanceController] Create Error:', error);
            res.status(500).json({ error: 'Failed to create maintenance record' });
        }
    }
}
