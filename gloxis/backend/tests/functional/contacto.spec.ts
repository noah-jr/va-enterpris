import { test } from '@japa/runner'

test.group('Contacto & Newsletter API (Functional)', () => {
  test('Deve submeter mensagem de contacto da Landing Page e enviar para Inbox Admin + Email', async ({ client }) => {
    const response = await client.post('/api/v1/contacto').json({
      nome: 'Maria da Silva',
      email: 'maria.silva@exemplo.ao',
      telefone: '923456789',
      assunto: 'Linha de Fomento PME',
      mensagem: 'Gostaria de obter informações sobre os apoios disponíveis para microempresas.',
    })

    response.assertStatus(201)
    response.assertBodyContains({
      success: true,
    })
  })

  test('Deve rejeitar submissão de contacto com campos obrigatórios em falta', async ({ client }) => {
    const response = await client.post('/api/v1/contacto').json({
      nome: 'Incompleto',
    })

    response.assertStatus(400)
    response.assertBodyContains({
      error: 'Campos obrigatórios em falta: Nome, E-mail e Mensagem são necessários.',
    })
  })

  test('Deve realizar subscrição de newsletter', async ({ client }) => {
    const response = await client.post('/api/v1/newsletter').json({
      email: 'cidadao@exemplo.ao',
    })

    response.assertStatus(201)
    response.assertBodyContains({
      success: true,
    })
  })
})
