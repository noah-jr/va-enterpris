import { type IClassificacaoRepository } from '../../Domain/Repositories/IClassificacaoRepository.js'

export class ListarClassificacoes {
  constructor(private repo: IClassificacaoRepository) {}

  async execute(nivel?: string, page?: number, perPage?: number) {
    return await this.repo.findAll(nivel, page, perPage)
  }
}
