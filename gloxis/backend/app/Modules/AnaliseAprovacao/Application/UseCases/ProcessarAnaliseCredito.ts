import { MotorDeScore } from '../../Domain/Services/MotorDeScore.js'
import { type IAnaliseAprovacaoRepository } from '../../Domain/Repositories/IAnaliseAprovacaoRepository.js'
import { AnaliseAprovacaoRepositoryImpl } from '../../Infrastructure/Repositories/AnaliseAprovacaoRepositoryImpl.js'
import { type SolicitacaoCredito } from '../../../SolicitacaoCredito/Domain/Entities/SolicitacaoCredito.js'
import emitter from '@adonisjs/core/services/emitter'

export class ProcessarAnaliseCredito {
  private repository: IAnaliseAprovacaoRepository
  private motorDeScore: MotorDeScore

  constructor(repository?: IAnaliseAprovacaoRepository, motorDeScore?: MotorDeScore) {
    this.repository = repository ?? new AnaliseAprovacaoRepositoryImpl()
    this.motorDeScore = motorDeScore ?? new MotorDeScore()
  }

  async execute(solicitacao: SolicitacaoCredito): Promise<void> {
    // 1. Verificar se já existe análise para evitar duplicidade
    const existe = await this.repository.findBySolicitacaoId(solicitacao.id)
    if (existe) {
      console.log(`[AnaliseAprovacao] Analise já realizada para solicitação ${solicitacao.id}`)
      return
    }

    // 2. Executar Motor de Score
    const analise = this.motorDeScore.analisar(solicitacao)

    // 3. Salvar Análise
    await this.repository.create(analise)

    // 4. Emitir evento de conclusão (para o módulo SolicitacaoCredito atualizar seu status)
    await emitter.emit('analise:concluida', {
      solicitacaoId: analise.solicitacaoId,
      decision: analise.decision,
    })
  }
}
