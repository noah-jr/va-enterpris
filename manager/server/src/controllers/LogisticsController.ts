import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class LogisticsController {
    static async getVehicles(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            
            const vehicles = await prisma.fleetVehicle.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' }
            });
            res.json(vehicles);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar veículos' });
        }
    }

    static async createVehicle(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const vehicleData = req.body;
            const newVehicle = await prisma.fleetVehicle.create({
                data: {
                    ...vehicleData,
                    companyId,
                    year: Number(vehicleData.year) || undefined
                }
            });
            res.status(201).json(newVehicle);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar veículo' });
        }
    }

    static async getTransports(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const transports = await prisma.transport.findMany({
                where: { companyId },
                include: { fleetVehicle: true },
                orderBy: { createdAt: 'desc' }
            });
            res.json(transports);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar transportes' });
        }
    }

    static async createTransport(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const transportData = req.body;
            const newTransport = await prisma.transport.create({
                data: {
                    ...transportData,
                    companyId
                }
            });
            res.status(201).json(newTransport);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar transporte' });
        }
    }
}
