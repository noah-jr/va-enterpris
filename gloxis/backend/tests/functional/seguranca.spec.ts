import { test } from '@japa/runner'
import User from '#models/user'
import { JwtService } from '../../app/Services/JwtService.js'
import speakeasy from 'speakeasy'

test.group('Segurança Avançada (Functional)', (group) => {
  let adminToken: string
  let adminUser: User

  group.setup(async () => {
    adminUser = await User.findByOrFail('email', 'admin_test@gloxis.com')
    const tokenPayload = { userId: adminUser.id, email: adminUser.email, role: adminUser.role }
    adminToken = JwtService.generateToken(tokenPayload, '1h')
  })

  test('Deve gerar um secret 2FA e ativar corretamente', async ({ client, assert }) => {
    // 1. Generate
    const generateRes = await client
      .post('/api/v1/account/2fa/generate')
      .header('Authorization', `Bearer ${adminToken}`)

    generateRes.dumpBody()
    generateRes.assertStatus(200)
    const secret = (generateRes.body() as any).data.secret
    assert.isNotNull(secret)

    // 2. Enable
    const token = speakeasy.totp({
      secret: secret,
      encoding: 'base32',
    })

    const enableRes = await client
      .post('/api/v1/account/2fa/enable')
      .header('Authorization', `Bearer ${adminToken}`)
      .json({ token })

    enableRes.assertStatus(200)
    enableRes.assertBodyContains({ message: '2FA ativado com sucesso' })

    // Refresh model
    await adminUser.refresh()
    assert.isTrue(!!adminUser.twoFactorEnabled)
  })

  test('Deve exigir 2FA durante o login após ativado', async ({ client }) => {
    // Tenta login sem token 2FA
    const loginRes = await client.post('/api/v1/auth/login').json({
      email: 'admin_test@gloxis.com',
      password: 'password123',
    })

    loginRes.assertStatus(200)
    loginRes.assertBodyContains({ requires_2fa: true })
  })

  test('Deve desativar 2FA com token válido', async ({ client, assert }) => {
    const token = speakeasy.totp({
      secret: adminUser.twoFactorSecret!,
      encoding: 'base32',
    })

    const disableRes = await client
      .post('/api/v1/account/2fa/disable')
      .header('Authorization', `Bearer ${adminToken}`)
      .json({ token })

    disableRes.assertStatus(200)

    await adminUser.refresh()
    assert.isFalse(!!adminUser.twoFactorEnabled)
  })
})
