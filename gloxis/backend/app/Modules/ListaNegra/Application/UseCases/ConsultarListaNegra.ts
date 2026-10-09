import ListaNegra from '../../../../models/lista_negra.js'

export class ConsultarListaNegra {
  /**
   * Check if a client is currently on the blacklist
   */
  async isClienteNaLista(clienteId: number): Promise<boolean> {
    const registro = await ListaNegra.query()
      .where('cliente_id', clienteId)
      .where('ativo', true)
      .first()
    return !!registro
  }

  async listar(page = 1, perPage = 20) {
    return await ListaNegra.query()
      .where('ativo', true)
      .preload('cliente')
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }

  async historico(clienteId: number) {
    return await ListaNegra.query().where('cliente_id', clienteId).orderBy('created_at', 'desc')
  }
}
