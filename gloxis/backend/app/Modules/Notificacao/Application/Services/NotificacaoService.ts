import {
  TwilioSMSProvider,
  ResendEmailProvider,
} from '../../Infrastructure/Providers/NotificationProviders.js'

export class NotificacaoService {
  public static async enviar({
    tipo,
    destinatario,
    mensagem,
  }: {
    tipo: 'SMS' | 'EMAIL'
    destinatario: string
    mensagem: string
  }): Promise<void> {
    try {
      if (tipo === 'SMS') {
        const provider = new TwilioSMSProvider()
        await provider.send(destinatario, mensagem)
      } else if (tipo === 'EMAIL') {
        const provider = new ResendEmailProvider()
        await provider.send(destinatario, mensagem)
      }
    } catch (err) {
      console.error(`[NOTIFICACAO ERROR] Falha ao enviar ${tipo} para ${destinatario}`, err)
    }
  }
}
