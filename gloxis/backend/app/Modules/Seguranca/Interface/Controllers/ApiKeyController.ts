import type { HttpContext } from '@adonisjs/core/http'
import crypto from 'node:crypto'
import ApiKey from '#models/api_key'
import type User from '#models/user'
import { DateTime } from 'luxon'

export default class ApiKeyController {
  public async generate({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail() as User
    const { name } = request.only(['name'])

    if (!name) {
      return response.badRequest({ error: 'O nome da chave é obrigatório' })
    }

    const key = crypto.randomBytes(32).toString('hex')

    const apiKey = await ApiKey.create({
      userId: user.id,
      name,
      key,
    })

    return response.created({
      data: {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key, // Só é mostrado 1 vez
      },
    })
  }

  public async list({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail() as User
    const keys = await ApiKey.query().where('userId', user.id).whereNull('revokedAt')

    return response.ok({
      data: keys.map((k) => ({
        id: k.id,
        name: k.name,
        lastUsedAt: k.lastUsedAt,
        createdAt: k.createdAt,
      })),
    })
  }

  public async revoke({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail() as User
    const key = await ApiKey.query().where('id', params.id).where('userId', user.id).firstOrFail()

    key.revokedAt = DateTime.now()
    await key.save()

    return response.ok({ message: 'Chave revogada com sucesso' })
  }
}
