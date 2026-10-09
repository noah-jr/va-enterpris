import { Request, Response } from 'express';
import prisma from '../lib/prisma';


export class MessageController {
    static async getInbox(req: Request, res: Response) {
        try {
            const companyId = (req as any).companyId;
            if (!companyId) return res.status(400).json({ error: 'Empresa não identificada' });

            const messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { isGlobal: true },
                        { companyId: companyId }
                    ]
                },
                orderBy: { createdAt: 'desc' }
            });

            res.json(messages);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao buscar comunicados' });
        }
    }

    // Apenas para testes/admin
    static async createBroadcast(req: Request, res: Response) {
        try {
            const { title, content, isGlobal, targetCompanyId } = req.body;

            const newMessage = await prisma.message.create({
                data: {
                    title,
                    content,
                    isGlobal: isGlobal ?? true,
                    companyId: targetCompanyId || null,
                    targetRole: 'ALL'
                }
            });

            res.status(201).json(newMessage);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro ao criar mensagem' });
        }
    }
}
