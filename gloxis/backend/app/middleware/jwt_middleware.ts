import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { JwtService } from '../Services/JwtService.js'
import User from '#models/user'

export default class JwtMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    let token = ''
    const authHeader = ctx.request.header('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else if (ctx.request.input('token')) {
      token = String(ctx.request.input('token'))
    }

    if (!token) {
      return ctx.response.unauthorized({ error: 'Token JWT não fornecido ou formato inválido' })
    }

    const isRevoked = await JwtService.isBlacklisted(token)
    if (isRevoked) {
      return ctx.response.unauthorized({ error: 'Token revogado (logout efetuado)' })
    }

    const decoded = JwtService.verifyToken(token)
    if (!decoded || !decoded.userId) {
      return ctx.response.unauthorized({ error: 'Token JWT inválido ou expirado' })
    }

    // Load user and attach it manually to the ctx.auth
    const user = await User.find(decoded.userId)
    if (!user) {
      return ctx.response.unauthorized({ error: 'Utilizador não encontrado' })
    }

    // Force password change check
    const currentPath = ctx.request.url()
    if (
      user.mustChangePassword &&
      !currentPath.includes('/auth/change-password') &&
      !currentPath.includes('/auth/logout')
    ) {
      return ctx.response.forbidden({
        requires_password_change: true,
        error: 'É obrigatório alterar a sua password gerada automaticamente antes de prosseguir.',
      })
    }

    ctx.auth = {
      ...ctx.auth,
      user,
      isAuthenticated: true,
      authenticate: async () => user,
      check: async () => true,
    } as unknown as HttpContext['auth']

    await next()
  }
}
