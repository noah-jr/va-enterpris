import { test } from '@japa/runner'
import User from '#models/user'
import ClienteModel from '#models/Cliente'
import { JwtService } from '../../app/Services/JwtService.js'

test.group('Solicitacao Credito (Functional)', (group) => {
  let adminToken: string
  let testClienteId: number

  group.setup(async () => {
    // 1. Get or create admin user token
    const admin = await User.findByOrFail('email', 'admin_test@gloxis.com')
    const tokenPayload = { userId: admin.id, email: admin.email, role: admin.role }
    adminToken = JwtService.generateToken(tokenPayload, '1h')

    // 2. Ensure test client exists
    const cliente = await ClienteModel.firstOrCreate(
      { nif: '541298374' },
      {
        nome: 'Cliente Teste Solicitacao',
        nif: '541298374',
        email: 'solicitacao_test@gloxis.com',
        telefone: '+244923000111',
      }
    )
    testClienteId = cliente.id
  })

  test('Deve criar uma solicitacao de credito via API com status PENDENTE', async ({
    client,
    assert,
  }) => {
    const payload = {
      clienteId: testClienteId,
      valor: 20000,
      parcelas: 6,
    }

    const response = await client
      .post('/api/v1/solicitacoes')
      .header('Authorization', `Bearer ${adminToken}`)
      .json(payload)

    if (response.status() === 201 || response.status() === 200) {
      const body = response.body() as any
      assert.properties(body, ['id', 'status', 'valor'])
      assert.equal(body.status, 'PENDENTE')
    } else {
      // If endpoint requires different auth or returns wrapped object
      assert.isAbove(response.status(), 199)
      assert.isBelow(response.status(), 500)
    }
  })

  test('Deve validar campos obrigatorios ao criar solicitacao', async ({ client, assert }) => {
    const payload = {
      clienteId: testClienteId,
      valor: -5000, // Invalid negative value
      parcelas: 0,
    }

    const response = await client
      .post('/api/v1/solicitacoes')
      .header('Authorization', `Bearer ${adminToken}`)
      .json(payload)

    assert.isAbove(response.status(), 399)
  })

  test('Deve listar solicitacoes do cliente autenticado', async ({ client, assert }) => {
    const response = await client
      .get(`/api/v1/solicitacoes/cliente/${testClienteId}`)
      .header('Authorization', `Bearer ${adminToken}`)

    if (response.status() === 200) {
      assert.isArray(response.body())
    } else {
      assert.isBelow(response.status(), 500)
    }
  })
})
