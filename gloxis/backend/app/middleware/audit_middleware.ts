import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import AuditLog from '#models/audit_log'

export default class AuditMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, auth } = ctx

    // Execute the request first to see if it succeeds
    await next()

    // Only log write actions (POST, PUT, PATCH, DELETE)
    const method = request.method()
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      try {
        const user = await auth.user

        // Remove sensitive info from payload if needed
        const payload = request.all()
        if (payload.password) delete payload.password
        if (payload.passwordConfirmation) delete payload.passwordConfirmation

        await AuditLog.create({
          userId: user?.id || null,
          action: `${method} ${request.url()}`,
          ipAddress: request.ip(),
          payload: payload,
        })
      } catch (error) {
        // Silent fail on audit log to not crash the request, just log it internally
        console.error('AuditLog Error:', error)
      }
    }
  }
}
