import { type IContabilidadeRepository } from '../../Domain/Repositories/IContabilidadeRepository.js'

export class GestaoContabilidadeUseCase {
  constructor(private repo: IContabilidadeRepository) {}

  async listar(page: number, perPage: number) {
    return this.repo.findAll(page, perPage)
  }

  async obterPorId(id: number) {
    const item = await this.repo.findById(id)
    if (!item) throw new Error('Contabilidade não encontrado')
    return item
  }

  async criar(data: Record<string, unknown>) {
    return this.repo.create(data)
  }

  async atualizar(id: number, data: Record<string, unknown>) {
    return this.repo.update(id, data)
  }

  async remover(id: number) {
    await this.repo.delete(id)
    return { success: true }
  }
}
