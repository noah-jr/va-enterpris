import ListaNegra from '../../../../models/lista_negra.js'
import { DateTime } from 'luxon'

export class RemoverListaNegra {
  async execute(data: {
    listaNegrId: number
    removidoPor: number
    justificativa: string
  }): Promise<ListaNegra> {
    const registro = await ListaNegra.findOrFail(data.listaNegrId)

    if (!registro.ativo) {
      throw new Error('Este cliente já foi removido da lista negra')
    }

    registro.ativo = false
    registro.removidoPor = data.removidoPor
    registro.dataRemocao = DateTime.now()
    registro.justificativaRemocao = data.justificativa

    await registro.save()
    return registro
  }
}
