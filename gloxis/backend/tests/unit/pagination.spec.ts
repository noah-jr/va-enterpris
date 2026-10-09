import { test } from '@japa/runner'
import { PaginationHelper } from '../../app/Modules/Core/Application/DTOs/PaginationDTO.js'

test.group('PaginationHelper (Unit)', () => {
  test('Deve normalizar page e perPage padrão quando inputs forem inválidos', ({ assert }) => {
    const { page, perPage } = PaginationHelper.normalizeParams(undefined, null)
    assert.equal(page, 1)
    assert.equal(perPage, 10)
  })

  test('Deve limitar perPage ao valor máximo permitido (100)', ({ assert }) => {
    const { page, perPage } = PaginationHelper.normalizeParams('2', '500')
    assert.equal(page, 2)
    assert.equal(perPage, 100)
  })

  test('Deve truncar números decimais e rejeitar valores negativos', ({ assert }) => {
    const { page, perPage } = PaginationHelper.normalizeParams(-5, 15.8)
    assert.equal(page, 1)
    assert.equal(perPage, 15)
  })

  test('Deve formatar a estrutura de resposta com meta e data corretamente', ({ assert }) => {
    const items = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]
    const result = PaginationHelper.formatResult(items, 25, 2, 10)

    assert.deepEqual(result.meta, {
      total: 25,
      perPage: 10,
      currentPage: 2,
      lastPage: 3,
      firstPage: 1,
    })
    assert.equal(result.data.length, 2)
  })
})
