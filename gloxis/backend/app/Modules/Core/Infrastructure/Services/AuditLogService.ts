import db from '@adonisjs/lucid/services/db'

export interface AuditLogData {
  userId?: number
  acao: string
  entidade: string
  entidadeId: number | string
  detalhes?: Record<string, unknown>
  ipAddress?: string
}

export class AuditLogService {
  public static async log(data: AuditLogData): Promise<void> {
    try {
      const hasTable = await db.connection().schema.hasTable('audit_logs')
      if (!hasTable) {
        return
      }

      await db.table('audit_logs').insert({
        user_id: data.userId || null,
        action: `${data.acao} [${data.entidade} #${data.entidadeId}]`,
        ip_address: data.ipAddress || '127.0.0.1',
        payload: JSON.stringify(data.detalhes || {}),
        created_at: new Date(),
      })
    } catch {
      // Falha silenciosa em auditoria
    }
  }
}
