import { type IClassificacaoRepository } from '../../Domain/Repositories/IClassificacaoRepository.js'

export class ObterClassificacao {
  constructor(private repo: IClassificacaoRepository) {}

  async execute(clienteId: number) {
    const classificacao = await this.repo.findByClienteId(clienteId)
    if (!classificacao) {
      return {
        clienteId,
        nivel: 'BRONZE',
        pontosFidelidade: 0,
        creditosPagosSucesso: 0,
        valorTotalPago: 0,
        diasMediosAtraso: 0,
      }
    }
    return classificacao
  }
}
