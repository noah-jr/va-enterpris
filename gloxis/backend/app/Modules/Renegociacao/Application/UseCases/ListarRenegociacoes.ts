import { type RenegociacaoRepositoryImpl } from '../../Infrastructure/Repositories/RenegociacaoRepositoryImpl.js'

export class ListarRenegociacoes {
  constructor(private repo: RenegociacaoRepositoryImpl) {}

  async execute() {
    return await this.repo.findAll()
  }
}
