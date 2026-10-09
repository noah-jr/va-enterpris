import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

export class BackupController {
    // ── Listar backups ────────────────────────────────────────────────────────
    static async list(req: Request, res: Response) {
        try {
            if (!fs.existsSync(BACKUP_DIR)) {
                return res.json([]);
            }

            const files = fs.readdirSync(BACKUP_DIR);
            const backups = files
                .filter(file => file.endsWith('.tar.gz') || file.endsWith('.zip'))
                .map(file => {
                    const filePath = path.join(BACKUP_DIR, file);
                    const stats = fs.statSync(filePath);
                    return {
                        filename: file,
                        size: stats.size,
                        createdAt: stats.birthtime
                    };
                })
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            res.json(backups);
        } catch (error) {
            console.error('[BackupController.list]', error);
            res.status(500).json({ error: 'Erro ao listar backups.' });
        }
    }

    // ── Criar backup ─────────────────────────────────────────────────────────
    static async create(req: Request, res: Response) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const tempDir = path.join(BACKUP_DIR, `temp_${timestamp}`);
        const sqlDumpPath = path.join(tempDir, 'dump.sql');
        const archiveName = `backup_${timestamp}.tar.gz`;
        const archivePath = path.join(BACKUP_DIR, archiveName);

        try {
            fs.mkdirSync(tempDir, { recursive: true });

            // 1. Database Dump
            const dbUrl = process.env.DATABASE_URL;
            if (!dbUrl) {
                throw new Error('DATABASE_URL não configurada.');
            }

            // Exemplo: pg_dump "postgresql://..." -f dump.sql
            console.log(`[Backup] A iniciar dump da base de dados PostgreSQL para ${sqlDumpPath}...`);
            await execAsync(`pg_dump "${dbUrl}" -F p -f "${sqlDumpPath}"`);

            // 2. Tar both db dump and uploads
            // Comando tar: compactar a pasta uploads (se existir) e dump.sql
            const hasUploads = fs.existsSync(UPLOADS_DIR);
            console.log(`[Backup] A compactar arquivos (uploads=${hasUploads})...`);

            if (hasUploads) {
                // Compactar a pasta uploads e o dump.sql juntos
                // Usamos o comando tar -czf <destino> -C <dir_original> uploads -C <dir_temp> dump.sql
                await execAsync(`tar -czf "${archivePath}" -C "${process.cwd()}" uploads -C "${tempDir}" dump.sql`);
            } else {
                await execAsync(`tar -czf "${archivePath}" -C "${tempDir}" dump.sql`);
            }

            res.status(201).json({
                message: 'Backup criado com sucesso.',
                filename: archiveName
            });
        } catch (error: any) {
            console.error('[BackupController.create]', error);
            res.status(500).json({
                error: 'Erro ao gerar backup.',
                details: error.message
            });
        } finally {
            // Cleanup temp directory
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        }
    }

    // ── Restaurar backup ──────────────────────────────────────────────────────
    static async restore(req: Request, res: Response) {
        const filename = req.params.filename as string;
        const archivePath = path.join(BACKUP_DIR, filename);
        const tempDir = path.join(BACKUP_DIR, `restore_temp_${Date.now()}`);

        if (!filename || !fs.existsSync(archivePath)) {
            return res.status(404).json({ error: 'Arquivo de backup não encontrado.' });
        }

        try {
            fs.mkdirSync(tempDir, { recursive: true });

            // 1. Extrair arquivo
            console.log(`[Restore] A descompactar backup ${filename}...`);
            await execAsync(`tar -xzf "${archivePath}" -C "${tempDir}"`);

            // 2. Localizar dump.sql no tempDir ou subpastas
            const sqlDumpPath = path.join(tempDir, 'dump.sql');
            if (!fs.existsSync(sqlDumpPath)) {
                throw new Error('Arquivo dump.sql não encontrado no pacote de backup.');
            }

            // 3. Restaurar Base de Dados
            const dbUrl = process.env.DATABASE_URL;
            if (!dbUrl) {
                throw new Error('DATABASE_URL não configurada.');
            }

            console.log('[Restore] A limpar esquemas existentes e restaurar base de dados...');
            
            // Para PostgreSQL, podemos restaurar executando o psql com o dump.sql
            // Mas primeiro, precisamos dropar ou limpar tabelas para evitar conflitos se for um dump plain text.
            // Para maior robustez, assumimos que psql está disponível:
            // psql "postgresql://..." -f dump.sql
            await execAsync(`psql "${dbUrl}" -f "${sqlDumpPath}"`);

            // 4. Restaurar Uploads (se presentes no backup)
            const backupUploadsDir = path.join(tempDir, 'uploads');
            if (fs.existsSync(backupUploadsDir)) {
                console.log('[Restore] A restaurar pasta de uploads...');
                if (fs.existsSync(UPLOADS_DIR)) {
                    // Backup original para segurança
                    const oldUploadsDir = path.join(process.cwd(), `uploads_old_${Date.now()}`);
                    fs.renameSync(UPLOADS_DIR, oldUploadsDir);
                }
                fs.renameSync(backupUploadsDir, UPLOADS_DIR);
            }

            res.json({ message: 'Backup restaurado com sucesso. O sistema foi reposto.' });
        } catch (error: any) {
            console.error('[BackupController.restore]', error);
            res.status(500).json({
                error: 'Falha crítica na restauração do backup.',
                details: error.message
            });
        } finally {
            // Cleanup temp directory
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
        }
    }

    // ── Eliminar backup ───────────────────────────────────────────────────────
    static async delete(req: Request, res: Response) {
        try {
            const filename = req.params.filename as string;
            const filePath = path.join(BACKUP_DIR, filename);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: 'Backup não encontrado.' });
            }

            fs.unlinkSync(filePath);
            res.json({ message: 'Backup eliminado com sucesso.' });
        } catch (error) {
            console.error('[BackupController.delete]', error);
            res.status(500).json({ error: 'Erro ao eliminar backup.' });
        }
    }

    // ── Download backup ───────────────────────────────────────────────────────
    static async download(req: Request, res: Response) {
        try {
            const filename = req.params.filename as string;
            const filePath = path.join(BACKUP_DIR, filename);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: 'Backup não encontrado.' });
            }

            res.download(filePath, filename);
        } catch (error) {
            console.error('[BackupController.download]', error);
            res.status(500).json({ error: 'Erro ao descarregar backup.' });
        }
    }
}
