import { type IProjetoRepository } from '../../Domain/Repositories/IProjetoRepository.js'

export class GestaoProjetoUseCase {
  constructor(private repo: IProjetoRepository) {}

  async listar(page: number, perPage: number) {
    return this.repo.findAll(page, perPage)
  }

  async obterPorId(id: number) {
    const item = await this.repo.findById(id)
    if (!item) throw new Error('Projeto não encontrado')
    return item
  }

  async criar(data: any) {
    return this.repo.create(data)
  }

  async atualizar(id: number, data: any) {
    return this.repo.update(id, data)
  }

  async remover(id: number) {
    await this.repo.delete(id)
    return { success: true }
  }
}
