import { ProcessarAnaliseCredito } from '../../Application/UseCases/ProcessarAnaliseCredito.js'
import { SolicitacaoCredito } from '../../../SolicitacaoCredito/Domain/Entities/SolicitacaoCredito.js'
import type { SolicitacaoCriadaEvent } from '../../../SolicitacaoCredito/Events/SolicitacaoCriadaEvent.js'

export default class ProcessarNovaSolicitacaoListener {
  public async handle(event: SolicitacaoCriadaEvent) {
    console.log(
      `[ProcessarNovaSolicitacaoListener] Processando análise de crédito para solicitação ${event.solicitacao.id}`
    )

    const solicitacao = new SolicitacaoCredito(
      event.solicitacao.id,
      event.solicitacao.clienteId,
      event.solicitacao.valor,
      event.solicitacao.parcelas,
      event.solicitacao.status,
      new Date(),
      new Date()
    )

    const useCase = new ProcessarAnaliseCredito()
    await useCase.execute(solicitacao)
  }
}
