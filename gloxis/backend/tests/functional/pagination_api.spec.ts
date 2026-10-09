import { test } from '@japa/runner'
import User from '#models/user'
import { JwtService } from '../../app/Services/JwtService.js'

test.group('Pagination API (Functional)', (group) => {
  let adminToken: string

  group.setup(async () => {
    const admin = await User.findByOrFail('email', 'admin_test@gloxis.com')
    const tokenPayload = { userId: admin.id, email: admin.email, role: admin.role }
    adminToken = JwtService.generateToken(tokenPayload, '1h')
  })

  test('Deve retornar resposta paginada estruturada na rota de campanhas com meta e data', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/campanhas?page=1&perPage=5')
      .header('Authorization', `Bearer ${adminToken}`)

    response.assertStatus(200)
    assert.properties(response.body(), ['meta', 'data'])
    assert.properties(response.body().meta, ['total', 'perPage', 'currentPage', 'lastPage'])
  })

  test('Deve retornar resposta paginada estruturada com filtro na rota financeira', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/financeiro?page=1&perPage=5')
      .header('Authorization', `Bearer ${adminToken}`)

    response.assertStatus(200)
    assert.properties(response.body(), ['meta', 'data'])
  })
})
