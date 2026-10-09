import emitter from '@adonisjs/core/services/emitter'
const ProcessarNovaSolicitacaoListener = () =>
  import('./Listeners/ProcessarNovaSolicitacaoListener.js')

emitter.on('solicitacao:criada', [ProcessarNovaSolicitacaoListener, 'handle'])

// Type augmentation for our new event (analise:concluida)
declare module '@adonisjs/core/types' {
  interface EventsList {
    'analise:concluida': {
      solicitacaoId: number
      decision: 'APROVADO' | 'REJEITADO' | 'MANUAL'
    }
  }
}
