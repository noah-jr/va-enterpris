import { type IClienteRepository } from '../../Domain/Repositories/IClienteRepository.js'

export class ObterClienteMe {
  constructor(private repository: IClienteRepository) {}

  async execute(userId: number) {
    return await this.repository.findByUserId(userId)
  }
}
