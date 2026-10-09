import type { HttpContext } from '@adonisjs/core/http'
import MensagemInbox from '#models/mensagem_inbox'
import AuditLog from '#models/audit_log'
import emitter from '@adonisjs/core/services/emitter'
import { NotificacaoService } from '../Modules/Notificacao/Application/Services/NotificacaoService.js'

export default class ContactoController {
  /**
   * Submeter formulário de contacto da Landing Page
   * POST /api/v1/contacto
   */
  public async submit({ request, response }: HttpContext) {
    try {
      const data = request.only(['nome', 'email', 'telefone', 'assunto', 'mensagem'])

      if (!data.nome || !data.email || !data.mensagem) {
        return response.badRequest({
          error: 'Campos obrigatórios em falta: Nome, E-mail e Mensagem são necessários.',
        })
      }

      const remetenteFormatado = `${data.nome} (${data.email}${data.telefone ? ` - Tel: ${data.telefone}` : ''})`
      const assuntoFinal = data.assunto
        ? `[CONTACTO] ${data.assunto}`
        : '[CONTACTO] Consulta Geral via Landing Page'

      // 1. Persistir na Inbox para acesso no Painel Admin
      const msg = await MensagemInbox.create({
        remetenteNome: remetenteFormatado,
        remetenteTipo: 'CLIENTE',
        destinatarioNome: 'Suporte Admin',
        destinatarioTipo: 'ADMIN',
        assunto: assuntoFinal,
        conteudo: data.mensagem,
        lida: false,
      })

      // 2. Registar em Audit Log
      try {
        await AuditLog.create({
          userId: null,
          action: 'CONTACTO_LANDING_SUBMIT',
          ipAddress: request.ip(),
          payload: { email: data.email, telefone: data.telefone, assunto: data.assunto, nome: data.nome },
        })
      } catch (err) {
        console.error('Erro ao gravar audit log do contacto:', err)
      }

      // 3. Notificar via SSE em tempo real no Admin
      emitter.emit('notificacao:realtime' as any, {
        type: 'NOVA_MENSAGEM',
        message: `Novo contacto de ${data.nome}: ${assuntoFinal}`,
        destinatario_nome: 'Suporte Admin',
        broadcast: true,
      })

      // 4. Enviar E-mail ao Correio do Admin e Confirmação ao Utilizador
      const mensagemEmailAdmin = `Novo contacto recebido no portal Gloxis:\n\nNome: ${data.nome}\nEmail: ${data.email}\nTelemóvel: ${data.telefone || 'Não informado'}\nAssunto: ${data.assunto || 'Geral'}\n\nMensagem:\n${data.mensagem}`
      const mensagemEmailCliente = `Olá ${data.nome},\n\nConfirmamos a recepção da sua mensagem no Portal Gloxis. A nossa equipa de apoio analisará a solicitação e responderá com a máxima brevidade.\n\nAssunto: ${data.assunto || 'Consulta'}\nReferência: GLX-INBOX-#${msg.id}\n\nCom os melhores cumprimentos,\nGloxis Financial Services`

      await NotificacaoService.enviar({
        tipo: 'EMAIL',
        destinatario: 'apoio@gloxis.gov.ao',
        mensagem: mensagemEmailAdmin,
      })

      await NotificacaoService.enviar({
        tipo: 'EMAIL',
        destinatario: data.email,
        mensagem: mensagemEmailCliente,
      })

      return response.created({
        success: true,
        message: 'A sua mensagem foi enviada com sucesso para a área administrativa e notificada por e-mail!',
        data: {
          id: msg.id,
          protocolo: `GLX-MSG-2026-${String(msg.id).padStart(5, '0')}`,
        },
      })
    } catch (error) {
      return response.internalServerError({
        error: 'Erro ao processar mensagem de contacto: ' + (error as Error).message,
      })
    }
  }

  /**
   * Subscrição de Newsletter
   * POST /api/v1/newsletter
   */
  public async subscribeNewsletter({ request, response }: HttpContext) {
    try {
      const email = request.input('email')
      if (!email) {
        return response.badRequest({ error: 'Endereço de e-mail é obrigatório.' })
      }

      const msg = await MensagemInbox.create({
        remetenteNome: `Newsletter Subscriber (${email})`,
        remetenteTipo: 'CLIENTE',
        destinatarioNome: 'Suporte Admin',
        destinatarioTipo: 'ADMIN',
        assunto: '[NEWSLETTER] Nova Subscrição de Informativo BNA',
        conteudo: `O utilizador ${email} subscreveu os boletins informativos e alertas de transparência BNA.`,
        lida: false,
      })

      await NotificacaoService.enviar({
        tipo: 'EMAIL',
        destinatario: email,
        mensagem: `Bem-vindo aos Informativos Oficiais da Gloxis Financial Services. Receberá atualizações sobre linhas de fomento e taxas BNA.`,
      })

      return response.created({
        success: true,
        message: 'Subscrição efetuada com sucesso! Notificação enviada para o seu e-mail.',
        data: { id: msg.id },
      })
    } catch (error) {
      return response.internalServerError({ error: (error as Error).message })
    }
  }
}
