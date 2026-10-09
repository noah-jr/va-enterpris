import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export class TrustedPartnerController {
    static async list(req: Request, res: Response) {
        try {
            const partners = await prisma.trustedPartner.findMany({
                where: { isActive: true },
                orderBy: { order: 'asc' }
            });
            res.json(partners);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao listar parceiros' });
        }
    }

    static async listAll(req: Request, res: Response) {
        try {
            const partners = await prisma.trustedPartner.findMany({
                orderBy: { order: 'asc' }
            });
            res.json(partners);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao listar parceiros' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const { name, logoUrl, websiteUrl, order } = req.body;
            const partner = await prisma.trustedPartner.create({
                data: {
                    name,
                    logoUrl,
                    websiteUrl,
                    order: Number(order) || 0
                }
            });
            res.status(201).json(partner);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao criar parceiro' });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, logoUrl, websiteUrl, order, isActive } = req.body;
            const partner = await prisma.trustedPartner.update({
                where: { id: id as string },
                data: {
                    name,
                    logoUrl,
                    websiteUrl,
                    order: order !== undefined ? Number(order) : undefined,
                    isActive
                }
            });
            res.json(partner);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao atualizar parceiro' });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await prisma.trustedPartner.delete({ where: { id: id as string } });
            res.status(204).send();
        } catch (e) {
            res.status(500).json({ error: 'Erro ao eliminar parceiro' });
        }
    }

    static async uploadLogo(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const file = (req as any).file;
            if (!file) return res.status(400).json({ error: 'Ficheiro não fornecido' });
            
            const partner = await prisma.trustedPartner.update({
                where: { id: id as string },
                data: { logoUrl: file.path }
            });
            res.json(partner);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao fazer upload do logotipo' });
        }
    }
}
