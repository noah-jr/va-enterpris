import { test } from '@japa/runner'
import ProdutoCreditoModel from '../../app/models/ProdutoCredito.js'

test.group('Simulador Credito API (Functional)', (group) => {
  let produtoId: number
  group.setup(async () => {
    // Garantir que existe um produto de crédito de teste
    const produto = await ProdutoCreditoModel.create({
      nome: 'Crédito Teste Funcional',
      taxaJurosMensal: 0.05,
      valorMinimo: 1000,
      valorMaximo: 50000,
      prazoMinimoMeses: 3,
      prazoMaximoMeses: 24,
      ativo: true,
    })
    produtoId = produto.id

    // Removed user creation since it's unused in this test
  })

  group.teardown(async () => {
    // Cleanup the created product
    const produto = await ProdutoCreditoModel.find(produtoId)
    if (produto) {
      await produto.delete()
    }
  })

  test('Deve retornar a simulação correta via API (Tabela Price)', async ({ client, assert }) => {
    const response = await client.post('/api/v1/simulador').json({
      produtoId: produtoId,
      valor: 10000,
      parcelas: 12,
    })

    if (response.status() !== 200) {
      console.log('ERROR 400:', response.body())
    }
    response.assertStatus(200)

    const body = response.body()

    // Validar estrutura do Payload
    assert.property(body, 'valorParcelaMensal')
    assert.property(body, 'totalGeralPagar')
    assert.property(body, 'cronograma')

    // Validar Matemática
    assert.equal(body.valorParcelaMensal, 1128.25)
    assert.equal(body.totalGeralPagar, 13539)
    assert.equal(body.jurosTotalPagar, 3539)
    assert.equal(body.cronograma.length, 12)
  })
})
