import { type IClassificacaoRepository } from '../../Domain/Repositories/IClassificacaoRepository.js'
import ClassificacaoClienteModel from '../../../../models/classificacao_cliente.js'

export class ClassificacaoRepositoryImpl implements IClassificacaoRepository {
  async findByClienteId(clienteId: number): Promise<any> {
    return await ClassificacaoClienteModel.query()
      .where('cliente_id', clienteId)
      .preload('cliente')
      .first()
  }

  async findAll(nivel?: string, page: number = 1, perPage: number = 20): Promise<any> {
    const query = ClassificacaoClienteModel.query().preload('cliente')
    if (nivel) {
      query.where('nivel', nivel)
    }
    return await query.orderBy('pontos_fidelidade', 'desc').paginate(page, perPage)
  }
}
