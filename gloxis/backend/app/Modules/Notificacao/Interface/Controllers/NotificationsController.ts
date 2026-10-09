import type { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'

export default class NotificationsController {
  public async stream({ request, response, auth }: HttpContext) {
    const user = auth.user!

    // Configura os cabeçalhos para Server-Sent Events (SSE)
    response.response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })

    const onMessage = (data: any) => {
      // Filtrar por destinatário direto
      const isForUser = data.destinatarioId === user.id || data.destinatario_nome === user.fullName
      // Admins/Gestores recebem notificações de reembolso submetido
      const isAdminRole = ['ADMIN', 'GESTOR', 'DIRETOR'].includes(user.role || '')
      const isAdminNotif = isAdminRole && (data.destinatarioRole === 'ADMIN' || data.broadcast)
      if (isForUser || isAdminNotif) {
        response.response.write(`data: ${JSON.stringify(data)}\n\n`)
      }
    }

    // Subscreve ao evento global do AdonisJS
    // @ts-ignore
    emitter.on('notificacao:realtime', onMessage)

    // Ping inicial
    response.response.write(
      `data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE Iniciado com Sucesso' })}\n\n`
    )

    // Mantém a ligação ativa (evita timeout de proxy/browser)
    const interval = setInterval(() => {
      response.response.write(`data: ${JSON.stringify({ type: 'PING' })}\n\n`)
    }, 15000)

    // Quando o cliente fecha o browser ou sai da página
    request.request.on('close', () => {
      clearInterval(interval)
      // @ts-ignore
      emitter.off('notificacao:realtime', onMessage)
    })
  }
}
