import ListaNegra from '../../../../models/lista_negra.js'
import { DateTime } from 'luxon'

export class AdicionarListaNegra {
  async execute(data: { clienteId: number; motivo: string }): Promise<ListaNegra> {
    // Check if already in lista negra
    const existing = await ListaNegra.query()
      .where('cliente_id', data.clienteId)
      .where('ativo', true)
      .first()

    if (existing) {
      return existing
    }

    return await ListaNegra.create({
      clienteId: data.clienteId,
      motivo: data.motivo,
      dataInclusao: DateTime.now(),
      ativo: true,
    })
  }
}
