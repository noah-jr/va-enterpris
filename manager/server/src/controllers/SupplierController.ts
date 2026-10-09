import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class SupplierController {
    static async index(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            const suppliers = await prisma.supplier.findMany({ where: { companyId } });
            res.json(suppliers);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar fornecedores' });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });
            const { name, nif, email, phone, address } = req.body;

            const newSupplier = await prisma.supplier.create({
                data: {
                    companyId,
                    name,
                    nif,
                    email,
                    phone,
                    address
                }
            });

            res.status(201).json(newSupplier);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar fornecedor' });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const existing = await prisma.supplier.findFirst({ where: { id: id as string, companyId } });
            if (!existing) return res.status(404).json({ error: 'Fornecedor não encontrado' });

            const updatedSupplier = await prisma.supplier.update({
                where: { id: id as string },
                data: req.body
            });

            res.json(updatedSupplier);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar fornecedor' });
        }
    }

    static async destroy(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const existing = await prisma.supplier.findFirst({ where: { id: id as string, companyId } });
            if (!existing) return res.status(404).json({ error: 'Fornecedor não encontrado' });

            await prisma.supplier.delete({ where: { id: id as string } });
            res.json({ message: 'Fornecedor deletado com sucesso' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao deletar fornecedor' });
        }
    }
}
