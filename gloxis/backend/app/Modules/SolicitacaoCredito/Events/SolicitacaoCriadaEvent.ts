import { type SolicitacaoCredito } from '../Domain/Entities/SolicitacaoCredito.js'

export class SolicitacaoCriadaEvent {
  constructor(public readonly solicitacao: SolicitacaoCredito) {}
}

declare module '@adonisjs/core/types' {
  interface EventsList {
    'solicitacao:criada': SolicitacaoCriadaEvent
  }
}
