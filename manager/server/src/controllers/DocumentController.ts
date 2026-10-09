import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export class DocumentController {
    static async getDocuments(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID required' });
            const documents = await prisma.document.findMany({
                where: { companyId },
                orderBy: { createdAt: 'desc' }
            });
            res.json(documents);
        } catch (error) {
            console.error('[Document GetAll Error]', error);
            res.status(500).json({ error: 'Erro ao buscar documentos' });
        }
    }

    static async createDocument(req: Request, res: Response) {
        try {
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID required' });
            const { name, type, size, owner, department, version, status, date, category, accessLevel } = req.body;
            
            console.log('[Document Create] Body:', req.body);
            console.log('[Document Create] File:', req.file);

            // Handle multi-provider file URLs
            let filePath = req.body.filePath;
            if (req.file) {
                const file = req.file as any;
                filePath = file.location || file.path;
                
                if (process.env.STORAGE_PROVIDER === 'local' || !process.env.STORAGE_PROVIDER) {
                    const host = req.get('host');
                    const protocol = req.protocol;
                    // Ensure relative path is used correctly
                    const cleanPath = file.path.replace(/\\/g, '/');
                    filePath = `${protocol}://${host}/${cleanPath}`;
                }
            }
            console.log('[Document Create] Final filePath:', filePath);

            const document = await prisma.document.create({
                data: {
                    companyId,
                    name,
                    type,
                    size: size || '—',
                    owner: owner || 'Administração',
                    department: department || 'Geral',
                    version: version || 'v1.0',
                    status: status || 'VALID',
                    date: date ? new Date(date) : new Date(),
                    category: category || 'OTHERS',
                    accessLevel: accessLevel || 'PUBLIC',
                    filePath
                }
            });
            res.status(201).json(document);
        } catch (error) {
            console.error('[Document Create Error]', error);
            res.status(500).json({ error: 'Erro ao criar documento' });
        }
    }

    static async updateDocument(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID required' });

            const { name, type, size, owner, department, version, status, category, accessLevel } = req.body;
            
            let filePath = undefined;
            if (req.file) {
                const file = req.file as any;
                filePath = file.location || file.path;
                if (process.env.STORAGE_PROVIDER === 'local' || !process.env.STORAGE_PROVIDER) {
                    const host = req.get('host');
                    const protocol = req.protocol;
                    filePath = `${protocol}://${host}/${file.path.replace(/\\/g, '/')}`;
                }
            }

            const document = await prisma.document.update({
                where: { id, companyId },
                data: { 
                    name, type, size, owner, department, version, status, category, accessLevel,
                    ...(filePath ? { filePath } : {}),
                    date: req.body.date ? new Date(req.body.date) : undefined
                }
            });

            res.json(document);
        } catch (error) {
            console.error('[Document Update Error]', error);
            res.status(500).json({ error: 'Erro ao atualizar documento' });
        }
    }


    static async deleteDocument(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const companyId = req.companyId;
            if (!companyId) return res.status(400).json({ error: 'Company ID required' });
            await prisma.document.delete({ where: { id, companyId } });
            res.json({ message: 'Documento removido' });
        } catch (error) {
            console.error('[Document Delete Error]', error);
            res.status(500).json({ error: 'Erro ao remover documento' });
        }
    }
}
