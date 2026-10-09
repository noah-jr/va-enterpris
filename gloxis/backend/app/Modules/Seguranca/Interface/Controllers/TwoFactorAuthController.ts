import type { HttpContext } from '@adonisjs/core/http'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import type User from '#models/user'

export default class TwoFactorAuthController {
  public async generate({ auth, response }: HttpContext) {
    const user = auth.user! as User

    const secret = speakeasy.generateSecret({
      name: `Gloxis (${user.email})`,
    })

    user.twoFactorSecret = secret.base32
    await user.save()

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    return response.ok({
      data: {
        secret: secret.base32,
        qrCodeUrl,
      },
    })
  }

  public async enable({ request, auth, response }: HttpContext) {
    const user = auth.user! as User
    const { token } = request.only(['token'])

    if (!user.twoFactorSecret) {
      return response.badRequest({ error: 'Segredo 2FA não gerado' })
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    })

    if (!verified) {
      return response.unauthorized({ error: 'Token 2FA inválido' })
    }

    user.twoFactorEnabled = true
    await user.save()

    return response.ok({ message: '2FA ativado com sucesso' })
  }

  public async disable({ request, auth, response }: HttpContext) {
    const user = auth.user! as User
    const { token } = request.only(['token'])

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: 'base32',
      token,
    })

    if (!verified) {
      return response.unauthorized({ error: 'Token 2FA inválido' })
    }

    user.twoFactorEnabled = false
    user.twoFactorSecret = null
    await user.save()

    return response.ok({ message: '2FA desativado com sucesso' })
  }
}
