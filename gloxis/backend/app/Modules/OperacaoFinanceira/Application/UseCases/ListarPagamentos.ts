import { type PagamentoRepositoryImpl } from '../../Infrastructure/Repositories/PagamentoRepositoryImpl.js'

export class ListarPagamentos {
  constructor(private repo: PagamentoRepositoryImpl) {}

  async execute() {
    return await this.repo.findAllPagamentos()
  }
}
