import type { IClienteRepository } from '../../Domain/Repositories/IClienteRepository.js'
import type { CreateClienteDTO } from '../DTOs/ClienteDTOs.js'

export class CadastrarCliente {
  constructor(private repo: IClienteRepository) {}

  async execute(payload: CreateClienteDTO) {
    if (!payload.email) {
      throw new Error(
        'O e-mail é obrigatório para registar um Cliente, pois será usado como credencial de acesso.'
      )
    }

    // Password padrão para todos os novos clientes — obrigados a trocar no 1º acesso
    const rawPassword = '12345678'

    // Em Clean Architecture, o repositório encarrega-se da persistência (User + Cliente em transação)
    const cliente = await this.repo.create({ ...payload, generatedPassword: rawPassword })

    return cliente
  }
}
