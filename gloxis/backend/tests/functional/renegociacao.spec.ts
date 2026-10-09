import { test } from '@japa/runner'
import User from '../../app/models/user.js'
import ClienteModel from '../../app/models/Cliente.js'
import ProdutoCreditoModel from '../../app/models/ProdutoCredito.js'
import SolicitacaoCreditoModel from '../../app/models/SolicitacaoCredito.js'
import PagamentoModel from '../../app/models/Pagamento.js'
import RenegociacaoModel from '../../app/models/Renegociacao.js'
import { DateTime } from 'luxon'

import { JwtService } from '../../app/Services/JwtService.js'

test.group('Renegociacao Lifecycle (Functional)', (group) => {
  let adminToken: string
  let solicitacaoId: number
  let clienteId: number

  group.setup(async () => {
    // 1. Create Admin
    const admin = await User.firstOrCreate(
      { email: 'admin_reneg@gloxis.com' },
      { fullName: 'Admin', password: 'password123', role: 'ADMIN' }
    )
    adminToken = JwtService.generateToken({
      userId: admin.id,
      email: admin.email,
      role: admin.role,
    })

    // 2. Create Cliente
    const cliente = await ClienteModel.firstOrCreate(
      { nif: '000111222BA045' },
      {
        nome: 'Cliente Inadimplente',
        isListaNegra: false,
        classificacao: 'NOVO',
      }
    )
    clienteId = cliente.id

    // 3. Create Produto
    await ProdutoCreditoModel.firstOrCreate(
      { nome: 'Produto Padrão' },
      {
        taxaJurosMensal: 0.05,
        valorMinimo: 1000,
        valorMaximo: 50000,
        prazoMinimoMeses: 3,
        prazoMaximoMeses: 24,
        ativo: true,
      }
    )

    // 4. Create SolicitacaoCredito (Approved)
    const solicitacao = await SolicitacaoCreditoModel.create({
      clienteId: cliente.id,
      valor: 10000,
      parcelas: 10,
      status: 'APROVADO',
    })
    solicitacaoId = solicitacao.id

    // 5. Create Old "Atrasado" Payments (Debt)
    // 3 parcelas atrasadas, cada uma com saldo principal 1000, juros de mora 200, multas 100
    for (let i = 1; i <= 3; i++) {
      await PagamentoModel.create({
        solicitacaoId: solicitacao.id,
        numeroParcela: i,
        valorParcela: 1000,
        valorPago: 0,
        valorJurosMora: 200,
        valorMulta: 100,
        status: 'ATRASADO',
        metodo: 'TRANSFERENCIA',
        dataVencimento: DateTime.now(),
      })
    }
  })

  group.teardown(async () => {
    // Cleanup cascade
    await RenegociacaoModel.query().delete()
    await PagamentoModel.query().where('solicitacao_id', solicitacaoId).delete()
    await SolicitacaoCreditoModel.find(solicitacaoId).then((s) => s?.delete())
  })

  test('Deve solicitar uma renegociação agregando as dívidas (Mora e Multas perdadas)', async ({
    client,
    assert,
  }) => {
    // A soma total do atraso seria: 3 * (1000 parcela + 200 mora + 100 multa) = 3900 total original
    // Se o gestor "perdoar" tudo e refinanciar apenas o principal atrasado, ele coloca 3000
    // O backend deve calcular essa diferença e colocar em jurosPerdoados

    const response = await client
      .post('/api/v1/renegociacoes')
      .header('Authorization', `Bearer ${adminToken}`)
      .json({
        solicitacaoId: solicitacaoId,
        clienteId: clienteId,
        jurosMoraPerdoados: 600, // 3 * 200
        multasPerdoadas: 300, // 3 * 100
        novasParcelas: 5,
        novaTaxaJuros: 2, // 2%
      })

    if (response.status() !== 201) {
      console.log('ERRO RENEGOCIACAO 400:', response.body())
    }
    response.assertStatus(201)
    const body = response.body()

    assert.property(body, 'data')
    assert.equal(body.data.solicitacaoId, solicitacaoId)
    assert.equal(body.data.saldoDevedorOriginal, 3900) // Total debt that was PENDENTE/ATRASADO
    assert.equal(body.data.jurosMoraPerdoados, 600) // Difference
    assert.equal(body.data.multasPerdoadas, 300)
    assert.equal(body.data.novoSaldoDevedor, 3000)
    assert.equal(body.data.novasParcelas, 5)
    assert.equal(body.data.novaTaxaJuros, 2)
    assert.equal(body.data.status, 'PENDENTE_APROVACAO')
  })

  test('Deve aprovar a renegociação, dropar as parcelas velhas e criar as novas', async ({
    client,
    assert,
  }) => {
    // 1. Fetch the renegotiation ID
    const renegociacoes = await RenegociacaoModel.all()
    const rId = renegociacoes[0].id

    // 2. Approve it
    const response = await client
      .post(`/api/v1/renegociacoes/${rId}/aprovar`)
      .header('Authorization', `Bearer ${adminToken}`)

    if (response.status() !== 200) {
      console.log('ERRO APROVAR 400:', response.body())
    }
    response.assertStatus(200)

    // 3. Verifica o Status
    const rDb = await RenegociacaoModel.find(rId)
    assert.equal(rDb?.status, 'APROVADO')
    assert.equal(
      rDb?.aprovadoPor,
      await User.findBy('email', 'admin_reneg@gloxis.com').then((u) => u!.id)
    )

    // 4. Verifica se as antigas sumiram (não pode ter 3 parcelas mais) e se foram criadas 5 novas
    const pagamentos = await PagamentoModel.query().where('solicitacao_id', solicitacaoId)
    assert.equal(pagamentos.length, 5)

    // O status das novas deve ser PENDENTE
    assert.equal(pagamentos[0].status, 'PENDENTE')
    assert.equal(pagamentos[0].numeroParcela, 1)

    // O valor da parcela de um Price de 3000 em 5x a 2% é: ~ 636.48
    assert.equal(Number(pagamentos[0].valorParcela), 636.48)
  })
})
