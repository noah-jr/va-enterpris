import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class SettingsController {
    static async getSettings(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID is required' });

            const company = await prisma.company.findUnique({
                where: { id: companyId },
                include: {
                    subscriptions: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            });

            if (!company) {
                return res.status(404).json({ error: 'Company not found' });
            }

            res.json({
                company: {
                    id: company.id,
                    name: company.name,
                    nif: company.nif,
                    email: company.email,
                    phone: company.phone,
                    address: company.address,
                    logo: company.logo
                },
                subscription: company.subscriptions[0] || null
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error while fetching settings' });
        }
    }

    static async updateCompany(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'ID da Empresa não encontrado' });

            const { name, email, phone, address, logo, nif } = req.body;

            const updatedCompany = await prisma.company.update({
                where: { id: companyId },
                data: {
                    name,
                    email,
                    phone,
                    address,
                    logo,
                    nif
                }
            });

            res.json({ message: 'Company settings updated', company: updatedCompany });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error while updating company settings' });
        }
    }
}
