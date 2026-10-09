import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export class SystemSettingsController {
    // Fetch all public settings
    static async getPublicSettings(_req: Request, res: Response) {
        try {
            const settings = await prisma.systemSetting.findMany({
                where: {
                    key: {
                        in: ['HERO_IMAGE_URL', 'SITE_TITLE', 'SITE_DESCRIPTION', 'HIDE_REGISTRATION', 'WAITLIST_ACTIVE']
                    }
                }
            });

            const settingsMap = settings.reduce((acc, curr) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {} as Record<string, string | null>);

            res.json(settingsMap);
        } catch (error) {
            console.error('[getPublicSettings]', error);
            res.status(500).json({ error: 'Erro ao carregar configurações públicas' });
        }
    }

    // Fetch all settings (Super Admin)
    static async getAllSettings(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const settings = await prisma.systemSetting.findMany();
            res.json(settings);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar configurações' });
        }
    }

    // Update or create a setting (Super Admin)
    static async updateSetting(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            if (!user || user.role !== 'SUPER_ADMIN') {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const { key, value, description } = req.body;

            if (!key) return res.status(400).json({ error: 'Chave é obrigatória.' });

            const setting = await prisma.systemSetting.upsert({
                where: { key },
                update: { value, description },
                create: { key, value, description }
            });

            res.json(setting);
        } catch (e) {
            res.status(500).json({ error: 'Erro ao actualizar definição.' });
        }
    }

    /** POST /api/admin/settings/upload — super admin */
    static async uploadSettingImage(req: Request, res: Response) {
        try {
            const { key } = req.body;
            const file = (req as any).file;

            if (!key || !file) {
                return res.status(400).json({ error: 'Key e arquivo são obrigatórios.' });
            }

            const setting = await prisma.systemSetting.upsert({
                where: { key },
                update: { value: file.path },
                create: { key, value: file.path, description: `Uploaded asset for ${key}` }
            });

            res.json(setting);
        } catch (e) {
            console.error('uploadSettingImage error:', e);
            res.status(500).json({ error: 'Erro ao fazer upload da imagem.' });
        }
    }
}
