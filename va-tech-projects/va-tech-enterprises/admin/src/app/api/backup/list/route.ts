import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
    try {
        const backupsDir = path.join(process.cwd(), 'backups');

        // Criar diretório se não existir
        try {
            await fs.mkdir(backupsDir, { recursive: true });
        } catch (error) {
            // Diretório já existe
        }

        // Ler arquivos do diretório
        let files: string[] = [];
        try {
            files = await fs.readdir(backupsDir);
        } catch (error) {
            console.log('Diretório de backups vazio ou não encontrado');
            return NextResponse.json({ backups: [] });
        }

        // Obter informações detalhadas de cada arquivo
        const backups = await Promise.all(
            files.map(async (filename) => {
                const filePath = path.join(backupsDir, filename);
                const stats = await fs.stat(filePath);

                // Determinar tipo de backup baseado no nome do arquivo
                let type = 'unknown';
                if (filename.includes('manual') || filename.endsWith('.sql')) {
                    type = 'sql';
                } else if (filename.includes('csv') || filename.includes('database')) {
                    type = 'csv';
                } else if (filename.includes('files')) {
                    type = 'files';
                }

                return {
                    filename,
                    type,
                    size: stats.size,
                    createdAt: stats.birthtime,
                    modifiedAt: stats.mtime,
                };
            })
        );

        // Ordenar por data de criação (mais recente primeiro)
        backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return NextResponse.json({ backups });
    } catch (error) {
        console.error('Erro ao listar backups:', error);
        return NextResponse.json(
            { error: 'Erro ao listar backups' },
            { status: 500 }
        );
    }
}
