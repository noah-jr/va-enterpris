import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export const getContracts = async (req: Request, res: Response) => {
    try {
        const companyId = req.companyId || (req.user as any)?.companyId;
        if (!companyId) return res.status(400).json({ error: 'Company ID not found' });
        const contracts = await prisma.contract.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(contracts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch contracts' });
    }
};

export const createContract = async (req: Request, res: Response) => {
    try {
        const companyId = req.companyId || (req.user as any)?.companyId;
        if (!companyId) return res.status(400).json({ error: 'Company ID not found' });
        const { title, entity, value, currency, expiryDate } = req.body;

        const contract = await prisma.contract.create({
            data: {
                companyId,
                title,
                entity,
                value: value ? Number(value) : null,
                currency,
                expiryDate: new Date(expiryDate)
            }
        });
        res.json(contract);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create contract' });
    }
};

export const updateContract = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const companyId = req.companyId || (req.user as any)?.companyId;
        if (!companyId) return res.status(400).json({ error: 'Company ID not found' });
        const contract = await prisma.contract.update({
            where: { id, companyId },
            data: {
                ...req.body,
                value: req.body.value ? Number(req.body.value) : undefined,
                expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined
            }
        });
        res.json(contract);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update contract' });
    }
};

export const deleteContract = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const companyId = req.companyId || (req.user as any)?.companyId;
        if (!companyId) return res.status(400).json({ error: 'Company ID not found' });
        await prisma.contract.delete({ where: { id, companyId } });
        res.json({ message: 'Contract deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete contract' });
    }
};
