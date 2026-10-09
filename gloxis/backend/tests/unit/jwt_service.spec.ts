import { test } from '@japa/runner'
import { JwtService } from '#services/JwtService'

test.group('unit / JwtService Token Security (Unit)', () => {
  test('deve gerar e verificar token JWT de acesso válido', ({ assert }) => {
    const payload = { userId: 1, email: 'cliente.teste@gloxis.co.ao', role: 'CLIENTE' }
    
    const token = JwtService.generateToken(payload, '1h')
    assert.isString(token)
    assert.isTrue(token.length > 20)

    const decoded = JwtService.verifyToken(token)
    assert.isNotNull(decoded)
    assert.equal(decoded?.userId, 1)
    assert.equal(decoded?.email, 'cliente.teste@gloxis.co.ao')
    assert.equal(decoded?.role, 'CLIENTE')
  })

  test('deve gerar e verificar refresh token válido', ({ assert }) => {
    const payload = { userId: 2, email: 'admin@gloxis.co.ao', role: 'ADMIN' }
    
    const refreshToken = JwtService.generateRefreshToken(payload, '7d')
    assert.isString(refreshToken)

    const decoded = JwtService.verifyRefreshToken(refreshToken)
    assert.isNotNull(decoded)
    assert.equal(decoded?.userId, 2)
    assert.equal(decoded?.role, 'ADMIN')
  })

  test('deve invalidar token adicionado à blacklist', async ({ assert }) => {
    const payload = { userId: 3, email: 'user3@gloxis.co.ao', role: 'CLIENTE' }
    const token = JwtService.generateToken(payload)

    assert.isNotNull(JwtService.verifyToken(token))

    await JwtService.addToBlacklist(token)

    assert.isNull(JwtService.verifyToken(token))
  })
})
