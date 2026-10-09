import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class FleetController {
    static async getVehicles(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const vehicles = await prisma.fleetVehicle.findMany({
                where: { companyId },
                include: { fuelRecords: true },
                orderBy: { plate: 'asc' }
            });
            res.json(vehicles);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar veículos da frota' });
        }
    }

    static async getFuelRecords(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const records = await prisma.fuelRecord.findMany({
                where: { companyId },
                include: { fleetVehicle: { select: { plate: true, brand: true, model: true } } },
                orderBy: { date: 'desc' },
                take: 100
            });
            res.json(records);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar registos de combustível' });
        }
    }

    static async createVehicle(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { plate, brand, model, type, year, driver, km, fuelType, department } = req.body;

            const vehicle = await prisma.fleetVehicle.create({
                data: {
                    companyId,
                    plate,
                    brand,
                    model,
                    type,
                    year: Number(year),
                    driver,
                    km: Number(km) || 0,
                    fuelType,
                    department,
                    status: 'AVAILABLE'
                }
            });
            res.status(201).json(vehicle);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao registar veículo' });
        }
    }

    static async addFuelRecord(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const { fleetVehicleId, liters, cost, km, station, date } = req.body;

            const record = await prisma.fuelRecord.create({
                data: {
                    companyId,
                    fleetVehicleId,
                    liters: Number(liters),
                    cost: Number(cost),
                    km: Number(km),
                    station,
                    date: date ? new Date(date) : new Date()
                }
            });

            // Update vehicle current KM
            await prisma.fleetVehicle.update({
                where: { id: fleetVehicleId },
                data: { km: Number(km) }
            });

            res.status(201).json(record);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao registar abastecimento' });
        }
    }
}
