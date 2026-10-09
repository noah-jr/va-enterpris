import type { HttpContext } from '@adonisjs/core/http'
import crypto from 'node:crypto'
import User from '#models/user'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'

export default class ResetPasswordController {
  public async forgotPassword({ request, response }: HttpContext) {
    const { email } = request.only(['email'])

    const user = await User.findBy('email', email)
    if (!user) {
      // Retorna 200 sempre para não expor quais emails existem
      return response.ok({ message: 'Se o email existir, receberá um link de recuperação' })
    }

    const token = crypto.randomBytes(32).toString('hex')

    user.resetPasswordToken = token
    user.resetPasswordExpires = DateTime.now().plus({ hours: 1 })
    await user.save()

    // Aqui integraria com o provider de email real. Para já registamos no log.
    logger.info(
      `[RECOVERY_EMAIL] Link de recuperação para ${user.email}: http://localhost:5173/reset-password?token=${token}`
    )

    return response.ok({ message: 'Se o email existir, receberá um link de recuperação' })
  }

  public async resetPassword({ request, response }: HttpContext) {
    const { token, newPassword } = request.only(['token', 'newPassword'])

    const user = await User.query()
      .where('resetPasswordToken', token)
      .where('resetPasswordExpires', '>', DateTime.now().toSQL()!)
      .first()

    if (!user) {
      return response.badRequest({ error: 'Token inválido ou expirado' })
    }

    user.password = newPassword
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    await user.save()

    return response.ok({ message: 'Password atualizada com sucesso' })
  }
}
