import { UpdateSolicitacaoStatus } from '../../Application/UseCases/UpdateSolicitacaoStatus.js'

export default class AtualizarStatusAnaliseListener {
  public async handle(event: {
    solicitacaoId: number
    decision: 'APROVADO' | 'REJEITADO' | 'MANUAL'
  }) {
    const useCase = new UpdateSolicitacaoStatus()
    console.log(
      `[AtualizarStatusAnaliseListener] Recebida decisão ${event.decision} para solicitação ${event.solicitacaoId}`
    )
    await useCase.execute({
      id: event.solicitacaoId,
      status: event.decision === 'MANUAL' ? 'PENDENTE' : event.decision,
    })
  }
}
