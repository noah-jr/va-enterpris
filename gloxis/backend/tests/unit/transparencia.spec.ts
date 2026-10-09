import { test } from '@japa/runner'
import TransparenciaController from '../../app/Modules/Transparencia/Interface/Controllers/TransparenciaController.js'

test.group('Transparencia Controller & Domain Unit Tests', () => {
  test('Deve instanciar TransparenciaController com métodos públicos e administrativos', ({
    assert,
  }) => {
    const controller = new TransparenciaController()
    assert.isFunction(controller.publicData)
    assert.isFunction(controller.index)
    assert.isFunction(controller.updateMetricas)
    assert.isFunction(controller.storeDocumento)
    assert.isFunction(controller.updateDocumento)
    assert.isFunction(controller.destroyDocumento)
  })
})
