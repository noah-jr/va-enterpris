import { type IRecursosHumanosRepository } from '../../Domain/Repositories/IRecursosHumanosRepository.js'

export class GestaoRecursosHumanosUseCase {
  constructor(private repo: IRecursosHumanosRepository) {}

  async listar(page: number, perPage: number) {
    return this.repo.findAll(page, perPage)
  }

  async obterPorId(id: number) {
    const item = await this.repo.findById(id)
    if (!item) throw new Error('RecursosHumanos não encontrado')
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
