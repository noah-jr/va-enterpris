import { test } from '@japa/runner'
import User from '#models/user'
import { JwtService } from '../../app/Services/JwtService.js'

test.group('Campanha (Functional)', (group) => {
  let adminToken: string

  group.setup(async () => {
    // Pegar admin real semeado
    const admin = await User.findByOrFail('email', 'admin_test@gloxis.com')
    const tokenPayload = { userId: admin.id, email: admin.email, role: admin.role }
    adminToken = JwtService.generateToken(tokenPayload, '1h')
  })

  group.teardown(async () => {
    const Campanha = (await import('#models/campanha')).default
    await Campanha.query().delete()
  })

  test('Deve criar uma campanha de Cashback via API', async ({ client, assert }) => {
    const payload = {
      nome: 'Campanha Fim de Ano',
      descricao: '10% de Cashback',
      descontoTaxaJuros: 0,
      percentualCashback: 10,
      dataInicio: new Date().toISOString(),
      dataFim: new Date(Date.now() + 86400000).toISOString(),
      ativo: true,
    }

    const response = await client
      .post('/api/v1/campanhas')
      .header('Authorization', `Bearer ${adminToken}`)
      .json(payload)

    response.assertStatus(201)
    response.assertBodyContains({ message: 'Campanha criada com sucesso' })
    assert.properties(response.body().data, ['id', 'nome', 'percentualCashback'])
  })

  test('Deve simular crédito com desconto de campanha aplicado', async ({ client, assert }) => {
    const { DateTime } = await import('luxon')
    // 1. Criar campanha ativa de desconto (50% de desconto)
    const Campanha = (await import('#models/campanha')).default
    await Campanha.create({
      nome: 'Black Friday',
      descricao: 'Juros pela metade',
      descontoTaxaJuros: 50,
      percentualCashback: 0,
      dataInicio: DateTime.now().minus({ minutes: 5 }) as any,
      dataFim: DateTime.now().plus({ days: 1 }) as any,
      ativo: true,
    })

    // 2. Simular (Produto ID 1 -> normalmente 5% de taxa de juros)
    // O valor normal seria PV * 5%... com desconto de 50%, a taxa fica 2.5% a.m.
    const simResponse = await client.post('/api/v1/simulador').json({
      produtoId: 1,
      valor: 100000,
      parcelas: 12,
    })

    simResponse.assertStatus(200)
    // Com 2.5% ao mês para 100.000: PMT = 100000 * 0.025 / (1 - 1.025^-12) = 9748.71
    assert.closeTo(simResponse.body().valorParcelaMensal, 9748.71, 1.0)
  })
})
