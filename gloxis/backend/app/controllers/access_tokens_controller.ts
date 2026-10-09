import User from '#models/user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

import { JwtService } from '../Services/JwtService.js'

export default class AccessTokensController {
  /**
   * @summary Fazer Login (Gerar Access Token)
   * @description Autentica o utilizador com email e password. Caso tenha 2FA ativo, é necessário fornecer o campo `token`.
   * @requestBody {"email": "user@example.com", "password": "password", "token": "123456"}
   * @responseBody 200 - {"user": {"id": 1, "email": "user@example.com"}, "token": "string", "refreshToken": "string"}
   * @responseBody 200 - {"requires_2fa": true, "message": "Código 2FA obrigatório"}
   * @responseBody 401 - {"error": "Credenciais inválidas ou Código 2FA inválido"}
   */
  async store({ request, response }: HttpContext) {
    const { email: identifier, password } = await request.validateUsing(loginValidator)
    let user: User | null = null

    try {
      user = await User.verifyCredentials(identifier, password)
    } catch {
      // If direct email lookup fails, try NIF lookup in clientes table
      const db = (await import('@adonisjs/lucid/services/db')).default
      const hash = (await import('@adonisjs/core/services/hash')).default

      const cliente = await db.from('clientes').where('nif', identifier).first()
      if (cliente) {
        let foundUser: User | null = null
        if (cliente.user_id) {
          foundUser = await User.find(cliente.user_id)
        }
        if (!foundUser && cliente.email) {
          foundUser = await User.findBy('email', cliente.email)
        }
        if (foundUser && (await hash.verify(foundUser.password, password))) {
          user = foundUser
        }
      }
    }

    if (!user) {
      return response.unauthorized({
        error: 'Credenciais inválidas. Verifique o NIF / E-mail e a palavra-passe.',
      })
    }

    if (user.twoFactorEnabled) {
      const { token: totpToken } = request.only(['token'])

      if (!totpToken) {
        return response.ok({ requires_2fa: true, message: 'Código 2FA obrigatório' })
      }

      const speakeasy = (await import('speakeasy')).default
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret!,
        encoding: 'base32',
        token: totpToken,
      })

      if (!verified) {
        return response.unauthorized({ error: 'Código 2FA inválido' })
      }
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    }
    const accessToken = JwtService.generateToken(tokenPayload, '15m')
    const refreshToken = JwtService.generateRefreshToken(tokenPayload, '7d')

    if (user.mustChangePassword) {
      return response.ok({
        requires_password_change: true,
        message:
          'Por razões de segurança, é obrigatório alterar a sua password gerada automaticamente antes de aceder à plataforma.',
        token: accessToken,
      })
    }

    // Retrieve client NIF if available
    const db = (await import('@adonisjs/lucid/services/db')).default
    const clienteRec = await db
      .from('clientes')
      .where('user_id', user.id)
      .orWhere('email', user.email)
      .first()
    const userPayload = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      nif: clienteRec?.nif || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return response.ok({
      data: {
        user: userPayload,
        token: accessToken,
        refreshToken: refreshToken,
      },
      token: accessToken,
      refreshToken: refreshToken,
      user: userPayload,
    })
  }

  /**
   * @summary Renovar Access Token
   * @description Gera um novo token JWT e um novo refresh token a partir de um refresh token válido.
   * @requestBody {"refreshToken": "string"}
   * @responseBody 200 - {"token": "string", "refreshToken": "string"}
   * @responseBody 400 - {"error": "Refresh token é obrigatório"}
   * @responseBody 401 - {"error": "Refresh token inválido ou expirado"}
   */
  async refresh({ request, response }: HttpContext) {
    const { refreshToken } = request.only(['refreshToken'])
    if (!refreshToken) {
      return response.badRequest({ error: 'Refresh token é obrigatório' })
    }

    const decoded = JwtService.verifyRefreshToken(refreshToken)
    if (!decoded || !decoded.userId) {
      return response.unauthorized({ error: 'Refresh token inválido ou expirado' })
    }

    const user = await User.find(decoded.userId)
    if (!user) {
      return response.unauthorized({ error: 'Utilizador não encontrado' })
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role }
    const newAccessToken = JwtService.generateToken(tokenPayload, '15m')
    const newRefreshToken = JwtService.generateRefreshToken(tokenPayload, '7d')

    return response.ok({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    })
  }

  /**
   * @summary Fazer Logout (Revogar Token)
   * @description Adiciona o token fornecido à blacklist do Redis para revogação imediata.
   * @responseBody 200 - {"message": "Logged out successfully"}
   */
  async destroy({ request, response }: HttpContext) {
    const authHeader = request.header('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      await JwtService.addToBlacklist(token)
    }

    return response.ok({
      message: 'Logged out successfully',
    })
  }

  /**
   * @summary Alterar Password (Primeiro Acesso)
   */
  async changePassword({ request, response }: HttpContext) {
    // Check auth
    const token = request.header('authorization')?.replace('Bearer ', '')
    if (!token) return response.unauthorized({ error: 'Token necessário' })

    const decoded = JwtService.verifyToken(token)
    if (!decoded || !decoded.userId) return response.unauthorized({ error: 'Token inválido' })

    const user = await User.find(decoded.userId)
    if (!user) return response.unauthorized({ error: 'Utilizador não encontrado' })

    const { newPassword } = request.only(['newPassword'])
    if (!newPassword || newPassword.length < 6) {
      return response.badRequest({ error: 'Password inválida. Deve ter pelo menos 6 caracteres.' })
    }

    user.password = newPassword
    user.mustChangePassword = false
    await user.save()

    // Revoga o token atual
    await JwtService.addToBlacklist(token)

    // Generate fresh tokens without mustChangePassword flag
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: false,
    }
    const accessToken = JwtService.generateToken(tokenPayload, '15m')
    const refreshToken = JwtService.generateRefreshToken(tokenPayload, '7d')

    return response.ok({
      message: 'Password alterada com sucesso.',
      token: accessToken,
      refreshToken: refreshToken,
    })
  }
}
