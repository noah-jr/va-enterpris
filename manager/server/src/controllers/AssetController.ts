import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export const getAssets = async (req: Request, res: Response) => {
    try {
        const companyId = req.companyId || (req.user as any)?.companyId;
        if (!companyId) return res.status(400).json({ error: 'Company ID not found' });

        const assets = await prisma.asset.findMany({
            where: { companyId },
            include: { maintenance: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(assets);
    } catch (error) {
        console.error('[Asset getAssets Error]', error);
        res.status(500).json({ error: 'Failed to fetch assets' });
    }
};

export const createAsset = async (req: Request, res: Response) => {
    try {
        const companyId = req.companyId || (req.user as any)?.companyId;
        if (!companyId) return res.status(400).json({ error: 'Company ID not found' });

        const { name, code, category } = req.body;

        const asset = await prisma.asset.create({
            data: {
                companyId,
                name,
                code,
                category
            }
        });
        res.json(asset);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create asset' });
    }
};

export const createMaintenanceRecord = async (req: Request, res: Response) => {
    try {
        const assetId = req.params.assetId as string
        const { type, description, cost, date, status } = req.body;

        const record = await prisma.maintenanceRecord.create({
            data: {
                assetId,
                type,
                description,
                cost,
                date: new Date(date),
                status
            }
        });

        // Update asset lastMaint
        await prisma.asset.update({
            where: { id: assetId },
            data: { lastMaint: new Date(date) }
        });

        res.json(record);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create maintenance record' });
    }
};
