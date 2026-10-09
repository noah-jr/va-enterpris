import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * RBAC middleware to restrict access based on user roles
 */
export default class RbacMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn, options: { guards?: string[] } = {}) {
    // Make sure user is authenticated
    const user = await auth.authenticate()

    if (options.guards && options.guards.length > 0) {
      const hasAccess = options.guards.includes(user.role)

      if (!hasAccess) {
        return response.forbidden({ error: 'Você não tem permissão para aceder este recurso.' })
      }
    }

    await next()
  }
}
