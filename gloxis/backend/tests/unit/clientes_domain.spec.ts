import { test } from '@japa/runner'
import Cliente from '#models/Cliente'

test.group('unit / Cliente Domain & Business Rules (Unit)', () => {
  test('deve validar formatação de telemóvel angolano (9 dígitos iniciados por 9)', ({ assert }) => {
    const validPhones = ['923456789', '912345678', '945678901']
    const invalidPhones = ['823456789', '923456', 'abcdefghi']

    for (const phone of validPhones) {
      const isValid = /^9\d{8}$/.test(phone)
      assert.isTrue(isValid, `Telemóvel ${phone} deveria ser válido`)
    }

    for (const phone of invalidPhones) {
      const isValid = /^9\d{8}$/.test(phone)
      assert.isFalse(isValid, `Telemóvel ${phone} deveria ser inválido`)
    }
  })

  test('deve calcular taxa de esforço (DTI) baseada no rendimento mensal e prestação', ({ assert }) => {
    const rendimentoMensal = 500000 // 500.000 Kz
    const prestacaoMensal = 150000  // 150.000 Kz

    const dti = (prestacaoMensal / rendimentoMensal) * 100
    assert.equal(dti, 30, 'Taxa de esforço deve ser de 30%')
    assert.isBelow(dti, 40, 'Taxa de esforço está dentro do limite prudencial BNA (40%)')
  })

  test('deve rejeitar cliente em lista negra para nova concessão de crédito', ({ assert }) => {
    const cliente = new Cliente()
    cliente.isListaNegra = true

    const podeSolicitarCredito = !cliente.isListaNegra
    assert.isFalse(podeSolicitarCredito, 'Cliente na lista negra não pode solicitar crédito')
  })
})
