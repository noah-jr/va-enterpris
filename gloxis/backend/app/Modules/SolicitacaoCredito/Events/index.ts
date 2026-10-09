import emitter from '@adonisjs/core/services/emitter'
const AtualizarStatusAnaliseListener = () => import('./Listeners/AtualizarStatusAnaliseListener.js')

emitter.on('analise:concluida', [AtualizarStatusAnaliseListener, 'handle'])
