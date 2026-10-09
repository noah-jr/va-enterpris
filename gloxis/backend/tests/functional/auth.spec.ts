import { test } from '@japa/runner'
import User from '../../app/models/user.js'

test.group('Auth API (Functional)', () => {
  test('Deve realizar o login de um utilizador existente e retornar o Token JWT', async ({
    client,
    assert,
  }) => {
    // Garantir que existe um Admin sem obrigatoriedade de mudar password
    const user = await User.firstOrCreate(
      { email: 'admin_test@gloxis.com' },
      {
        fullName: 'Admin Teste',
        password: 'password123',
        role: 'ADMIN',
        mustChangePassword: false,
      }
    )
    user.mustChangePassword = false
    user.password = 'password123'
    await user.save()

    const response = await client.post('/api/v1/auth/login').json({
      email: 'admin_test@gloxis.com',
      password: 'password123',
    })

    response.assertStatus(200)

    const body = response.body() as any

    assert.property(body, 'data')
    assert.property(body.data, 'token')
    assert.property(body.data, 'refreshToken')
    assert.property(body.data, 'user')

    const userEmail = body.data.user.email || body.data.user.transformerData?.[0]?.email
    const userRole = body.data.user.role || body.data.user.transformerData?.[0]?.role

    assert.equal(userEmail, 'admin_test@gloxis.com')
    assert.equal(userRole, 'ADMIN')
  })

  test('Deve atualizar o token usando o refresh token (Refresh)', async ({ client, assert }) => {
    // 1. Faz Login para obter o refreshToken
    const loginResponse = await client.post('/api/v1/auth/login').json({
      email: 'admin_test@gloxis.com',
      password: 'password123',
    })

    const body = loginResponse.body() as any
    const refreshToken = body.data.refreshToken
    assert.isNotNull(refreshToken)

    // 2. Chama a rota de refresh
    const refreshResponse = await client.post('/api/v1/auth/refresh').json({
      refreshToken: refreshToken,
    })

    refreshResponse.assertStatus(200)
    const refreshBody = refreshResponse.body()

    assert.property(refreshBody, 'token')
    assert.property(refreshBody, 'refreshToken')
    assert.isString(refreshBody.token)
  })

  test('Deve falhar ao tentar login com credenciais incorretas', async ({ client }) => {
    const response = await client.post('/api/v1/auth/login').json({
      email: 'admin_test@gloxis.com',
      password: 'passwordERRADA',
    })

    response.assertStatus(401)
  })
})
