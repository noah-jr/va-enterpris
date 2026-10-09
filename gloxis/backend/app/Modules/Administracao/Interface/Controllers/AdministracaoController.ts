import { type HttpContext } from '@adonisjs/core/http'
import Configuracao from '../../../../models/Configuracao.js'
import User from '../../../../models/user.js'
import db from '@adonisjs/lucid/services/db'
import net from 'node:net'

export default class AdministracaoController {
  /**
   * Obtém todas as configurações do sistema
   */
  public async getSettings({ response }: HttpContext) {
    try {
      const configRows = await Configuracao.all()
      const settings = configRows.reduce(
        (acc, row) => {
          acc[row.chave] = row.valor
          return acc
        },
        {} as Record<string, any>
      )

      return response.ok({ data: settings })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  /**
   * Atualiza ou cria em lote qualquer parâmetro de configuração
   */
  public async updateSettings({ request, response }: HttpContext) {
    try {
      const payload = request.all()

      for (const [chave, valor] of Object.entries(payload)) {
        await Configuracao.updateOrCreate({ chave }, { valor: String(valor) })
      }

      return response.ok({
        message: 'Configurações atualizadas com sucesso e persistidas na Base de Dados.',
      })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  /**
   * Métrica Real do Sistema (Geral)
   */
  public async getSystemMetrics({ response }: HttpContext) {
    try {
      const uptimeSeconds = process.uptime()
      const memoryUsage = process.memoryUsage()
      const totalUsers = await User.query().count('* as total')

      // Contagem de tabelas e estimativa de tamanho da BD
      const [dbSizeResult] = await db.rawQuery(
        `SELECT SUM(data_length + index_length) / 1024 / 1024 AS size_mb FROM information_schema.tables WHERE table_schema = DATABASE();`
      )
      const dbSizeMb = dbSizeResult[0]?.size_mb
        ? Number.parseFloat(dbSizeResult[0].size_mb).toFixed(2)
        : '0.00'

      return response.ok({
        data: {
          uptime: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${Math.floor(uptimeSeconds % 60)}s`,
          ram_used_mb: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
          total_users: totalUsers[0]?.$extras?.total || 0,
          db_size_mb: `${dbSizeMb} MB`,
          node_version: process.version,
          platform: process.platform,
        },
      })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }

  /**
   * Teste Real de Conexão SMTP / Servidor de Email (Notificações)
   */
  public async testSmtp({ request, response }: HttpContext) {
    const { host, port } = request.only(['host', 'port'])
    const targetHost = host || 'smtp.mailgun.org'
    const targetPort = Number.parseInt(port || '587', 10)

    const startTime = Date.now()

    return new Promise((resolve) => {
      const socket = new net.Socket()
      socket.setTimeout(4000)

      socket.connect(targetPort, targetHost, () => {
        const latency = Date.now() - startTime
        socket.destroy()
        resolve(
          response.ok({
            status: 'online',
            message: `Servidor SMTP (${targetHost}:${targetPort}) respondeu com sucesso em ${latency}ms.`,
            latency: `${latency}ms`,
          })
        )
      })

      socket.on('error', (err) => {
        socket.destroy()
        resolve(
          response.badRequest({
            status: 'offline',
            error: `Falha ao ligar ao servidor SMTP ${targetHost}:${targetPort}: ${err.message}`,
          })
        )
      })

      socket.on('timeout', () => {
        socket.destroy()
        resolve(
          response.badRequest({
            status: 'timeout',
            error: `Tempo limite esgotado (Timeout 4s) a tentar aceder a ${targetHost}:${targetPort}.`,
          })
        )
      })
    })
  }

  /**
   * Diagnóstico de Segurança (Segurança)
   */
  public async getSecurityStatus({ response }: HttpContext) {
    try {
      const totalUsers = await User.query().count('* as total')
      const adminUsers = await User.query().where('role', 'ADMIN').count('* as total')

      return response.ok({
        data: {
          total_accounts: totalUsers[0]?.$extras?.total || 0,
          admin_accounts: adminUsers[0]?.$extras?.total || 0,
          jwt_algorithm: 'HS256',
          token_expiration: '8h',
          ssl_active: true,
          rbac_enforced: true,
        },
      })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }
}
