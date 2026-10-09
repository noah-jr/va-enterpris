import { type HttpContext } from '@adonisjs/core/http'
import fs from 'node:fs'
import path from 'node:path'
import db from '@adonisjs/lucid/services/db'
import env from '#start/env'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export default class BackupController {
  private backupDir = path.join(process.cwd(), 'storage', 'backups')

  constructor() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
    }
  }

  /**
   * 1. Listar Backups no Disco
   */
  public async list({ response }: HttpContext) {
    try {
      if (!fs.existsSync(this.backupDir)) {
        return response.ok({ data: [] })
      }

      const files = fs
        .readdirSync(this.backupDir)
        .filter((file) => file.endsWith('.sql'))
        .map((file) => {
          const filepath = path.join(this.backupDir, file)
          const stats = fs.statSync(filepath)
          return {
            filename: file,
            size: (stats.size / 1024).toFixed(2) + ' KB',
            created_at: stats.birthtime,
          }
        })
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())

      return response.ok({ data: files })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao aceder à storage de backups: ' + (error as Error).message,
      })
    }
  }

  /**
   * 2. Criar Backup Real da Base de Dados MySQL
   */
  public async create({ response }: HttpContext) {
    try {
      const dbHost = env.get('DB_HOST', '127.0.0.1')
      const dbPort = env.get('DB_PORT', '3306')
      const dbUser = env.get('DB_USER', 'root')
      const dbPass = env.get('DB_PASSWORD', '')
      const dbName = env.get('DB_DATABASE', 'gloxis')

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, 19)
      const filename = `backup_${dbName}_${timestamp}.sql`
      const filepath = path.join(this.backupDir, filename)

      // Tentar backup nativo mysqldump CLI
      let dumpSuccess = false
      try {
        const passFlag = dbPass ? `-p"${dbPass}"` : ''
        const cmd = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} ${passFlag} ${dbName} > "${filepath}"`
        await execAsync(cmd)
        dumpSuccess = fs.existsSync(filepath) && fs.statSync(filepath).size > 0
      } catch (cliErr) {
        // Fallback: Backup programático via queries SQL em caso de ausência do mysqldump no host OS
      }

      // Se o CLI falhou ou não existe mysqldump no sistema, fazemos a extração DDL/DML direta da BD
      if (!dumpSuccess) {
        const sqlDump = await this.generatePureSqlDump(dbName)
        fs.writeFileSync(filepath, sqlDump, 'utf8')
      }

      const stats = fs.statSync(filepath)
      return response.ok({
        message: 'Backup real gerado e verificado com sucesso na Storage.',
        data: {
          filename,
          size: (stats.size / 1024).toFixed(2) + ' KB',
          created_at: stats.birthtime,
        },
      })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao gerar backup da base de dados: ' + (error as Error).message,
      })
    }
  }

  /**
   * 3. Restaurar Backup na Base de Dados MySQL (Recover Real)
   */
  public async restore({ request, response }: HttpContext) {
    try {
      const { filename } = request.all()
      if (!filename) {
        return response.badRequest({ error: 'Nome do ficheiro não especificado.' })
      }

      const filepath = path.join(this.backupDir, filename)
      if (!fs.existsSync(filepath)) {
        return response.notFound({ error: 'Ficheiro de backup não encontrado na storage.' })
      }

      let restored = false
      // Tentativa 1: Execução nativa via CLI mysql
      try {
        const dbHost = env.get('DB_HOST', '127.0.0.1')
        const dbPort = env.get('DB_PORT', '3306')
        const dbUser = env.get('DB_USER', 'root')
        const dbPass = env.get('DB_PASSWORD', '')
        const dbName = env.get('DB_DATABASE', 'gloxis')
        const passFlag = dbPass ? `-p"${dbPass}"` : ''

        const cmd = `mysql -h ${dbHost} -P ${dbPort} -u ${dbUser} ${passFlag} ${dbName} < "${filepath}"`
        await execAsync(cmd)
        restored = true
      } catch (cliErr) {
        // Fallback para execução programática statement a statement
      }

      if (!restored) {
        const sqlContent = fs.readFileSync(filepath, 'utf8')

        // Desativar restrições de chaves estrangeiras durante o restauro
        await db.rawQuery('SET FOREIGN_KEY_CHECKS = 0;')

        // Dividir por instruções SQL válidas
        const statements = sqlContent
          .split(/;\s*$/m)
          .map((stmt) => stmt.trim())
          .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'))

        for (const statement of statements) {
          try {
            await db.rawQuery(statement)
          } catch (stmtErr) {
            console.warn('Aviso durante execução do statement de backup:', (stmtErr as Error).message)
          }
        }

        await db.rawQuery('SET FOREIGN_KEY_CHECKS = 1;')
      }

      return response.ok({
        message: `Base de dados restaurada com sucesso a partir de ${filename}!`,
      })
    } catch (error) {
      await db.rawQuery('SET FOREIGN_KEY_CHECKS = 1;').catch(() => {})
      return response.internalServerError({
        error: 'Erro crítico ao restaurar base de dados: ' + (error as Error).message,
      })
    }
  }

  /**
   * 4. Upload de Ficheiro SQL Externo para Storage
   */
  public async upload({ request, response }: HttpContext) {
    try {
      const file = request.file('file', {
        extnames: ['sql'],
        size: '100mb',
      })

      if (!file) {
        return response.badRequest({ error: 'Nenhum ficheiro .sql foi selecionado.' })
      }

      if (!file.isValid) {
        return response.badRequest({ error: file.errors[0]?.message || 'Ficheiro inválido.' })
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)
      const cleanName = (file.clientName || 'uploaded.sql').replace(/[^a-zA-Z0-9_.-]/g, '_')
      const filename = `upload_${timestamp}_${cleanName}`

      await file.move(this.backupDir, { name: filename })

      return response.ok({
        message: 'Ficheiro SQL carregado com sucesso para a Storage!',
        data: { filename },
      })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao carregar ficheiro SQL: ' + (error as Error).message,
      })
    }
  }

  /**
   * 5. Apagar Ficheiro de Backup
   */
  public async destroy({ request, response }: HttpContext) {
    try {
      const { filename } = request.all()
      if (!filename) {
        return response.badRequest({ error: 'Nome de ficheiro inválido.' })
      }

      const filepath = path.join(this.backupDir, filename)
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }

      return response.ok({ message: 'Ficheiro de backup eliminado com sucesso.' })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao apagar ficheiro: ' + (error as Error).message,
      })
    }
  }

  /**
   * 6. Download do Ficheiro SQL de Backup
   */
  public async download({ params, response }: HttpContext) {
    try {
      const filename = params.filename
      if (!filename) {
        return response.badRequest({ error: 'Nome do ficheiro não especificado.' })
      }

      const filepath = path.join(this.backupDir, filename)
      if (!fs.existsSync(filepath)) {
        return response.notFound({ error: 'Ficheiro de backup não encontrado na storage.' })
      }

      return response.download(filepath)
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao efetuar o download do ficheiro: ' + (error as Error).message,
      })
    }
  }

  /**
   * Helper Senior: Motor de Extração Nativa de Dump SQL (DDL + DML)
   */
  private async generatePureSqlDump(dbName: string): Promise<string> {
    const lines: string[] = []
    lines.push(`-- GLOXIS ERP REAL DATABASE BACKUP DUMP`)
    lines.push(`-- Database: ${dbName}`)
    lines.push(`-- Timestamp: ${new Date().toISOString()}`)
    lines.push(`\nSET FOREIGN_KEY_CHECKS = 0;\n`)

    const [tablesResult] = await db.rawQuery('SHOW TABLES;')
    const tableKeys = Object.keys(tablesResult[0] || {})
    if (tableKeys.length === 0) return lines.join('\n')

    const tableNameKey = tableKeys[0]
    const tables: string[] = tablesResult.map((row: any) => row[tableNameKey])

    for (const table of tables) {
      lines.push(`-- ------------------------------------------------------`)
      lines.push(`-- Table structure for table \`${table}\``)
      lines.push(`-- ------------------------------------------------------`)
      lines.push(`DROP TABLE IF EXISTS \`${table}\`;`)

      const [createResult] = await db.rawQuery(`SHOW CREATE TABLE \`${table}\`;`)
      if (createResult && createResult[0]) {
        const createSql = createResult[0]['Create Table']
        lines.push(`${createSql};\n`)
      }

      lines.push(`-- Dumping data for table \`${table}\``)
      const [rows] = await db.rawQuery(`SELECT * FROM \`${table}\`;`)
      if (Array.isArray(rows) && rows.length > 0) {
        for (const row of rows) {
          const keys = Object.keys(row)
            .map((k) => `\`${k}\``)
            .join(', ')
          const values = Object.values(row)
            .map((val) => {
              if (val === null || val === undefined) return 'NULL'
              if (typeof val === 'number' || typeof val === 'boolean') return val
              if (val instanceof Date)
                return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`
              if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "\\'")}'`
              return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
            })
            .join(', ')

          lines.push(`INSERT INTO \`${table}\` (${keys}) VALUES (${values});`)
        }
      }
      lines.push('\n')
    }

    lines.push(`SET FOREIGN_KEY_CHECKS = 1;`)
    return lines.join('\n')
  }
}
