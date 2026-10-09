import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup_${timestamp}.sql`;
        const backupPath = path.join(process.cwd(), 'backups', filename);

        // Criar diretório de backups se não existir
        await fs.mkdir(path.join(process.cwd(), 'backups'), { recursive: true });

        // Obter configurações do banco de dados da URL
        const dbUrl = process.env.DATABASE_URL || '';
        const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

        if (!urlMatch) {
            throw new Error('DATABASE_URL inválida');
        }

        const [, user, password, host, port, database] = urlMatch;

        // Criar backup usando mysqldump
        const command = `mysqldump -h ${host} -P ${port} -u ${user} -p${password} ${database} > ${backupPath}`;

        try {
            await execAsync(command);
        } catch (error) {
            // Se mysqldump não estiver disponível, fazer backup manual
            console.log('mysqldump não disponível, usando método alternativo');
            return await createManualBackup();
        }

        // Ler o arquivo de backup
        const backupData = await fs.readFile(backupPath);

        // Remover arquivo temporário
        await fs.unlink(backupPath);

        // Retornar arquivo como download
        return new NextResponse(backupData, {
            headers: {
                'Content-Type': 'application/sql',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Erro ao criar backup SQL:', error);
        return NextResponse.json(
            { error: 'Erro ao criar backup SQL' },
            { status: 500 }
        );
    }
}

async function createManualBackup() {
    try {
        let sqlContent = `-- Backup Manual da Base de Dados\n`;
        sqlContent += `-- Gerado em: ${new Date().toISOString()}\n\n`;

        // Obter todas as tabelas - usar TABLE_NAME em maiúsculas pois é assim que o MySQL retorna
        const tables = await prisma.$queryRaw<Array<{ TABLE_NAME: string }>>`
            SELECT TABLE_NAME
            FROM information_schema.tables 
            WHERE table_schema = DATABASE()
        `;

        for (const { TABLE_NAME: table_name } of tables) {
            try {
                // Adicionar estrutura da tabela
                sqlContent += `\n-- Estrutura da tabela ${table_name}\n`;
                sqlContent += `DROP TABLE IF EXISTS \`${table_name}\`;\n`;

                // Usar queryRawUnsafe para SHOW CREATE TABLE
                const createTable = await prisma.$queryRawUnsafe<Array<{ 'Create Table': string }>>(
                    `SHOW CREATE TABLE \`${table_name}\``
                );

                if (createTable[0] && createTable[0]['Create Table']) {
                    sqlContent += `${createTable[0]['Create Table']};\n\n`;
                }

                // Adicionar dados da tabela
                sqlContent += `-- Dados da tabela ${table_name}\n`;
                const rows = await prisma.$queryRawUnsafe(`SELECT * FROM \`${table_name}\``);

                if (Array.isArray(rows) && rows.length > 0) {
                    const columns = Object.keys(rows[0]);
                    const columnsList = columns.map(col => `\`${col}\``).join(', ');

                    for (const row of rows) {
                        const values = columns.map(col => {
                            const val = (row as any)[col];
                            if (val === null) return 'NULL';
                            if (typeof val === 'string') {
                                // Escapar strings corretamente para SQL
                                const escaped = val.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                                return `'${escaped}'`;
                            }
                            if (val instanceof Date) return `'${val.toISOString()}'`;
                            if (typeof val === 'boolean') return val ? '1' : '0';
                            return val;
                        }).join(', ');

                        sqlContent += `INSERT INTO \`${table_name}\` (${columnsList}) VALUES (${values});\n`;
                    }
                }
                sqlContent += '\n';
            } catch (tableError) {
                console.error(`Erro ao processar tabela ${table_name}:`, tableError);
                sqlContent += `-- Erro ao processar tabela ${table_name}\n\n`;
            }
        }

        const buffer = Buffer.from(sqlContent, 'utf-8');
        const filename = `backup_manual_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/sql',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('Erro ao criar backup manual:', error);
        throw error;
    }
}
