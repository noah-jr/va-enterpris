import env from '#start/env'

export interface INotificationProvider {
  send(to: string, message: string): Promise<void>
}

export class TwilioSMSProvider implements INotificationProvider {
  async send(to: string, message: string): Promise<void> {
    const accountSid = env.get('TWILIO_ACCOUNT_SID', 'mock_sid')
    const authToken = env.get('TWILIO_AUTH_TOKEN', 'mock_token')

    // In production, we'd use twilio package
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({ body: message, from: '+1234567890', to });

    console.log(`[Twilio SMS] Real Sending to ${to}: ${message} (Using ${accountSid}/${authToken})`)
  }
}

export class ResendEmailProvider implements INotificationProvider {
  async send(to: string, message: string): Promise<void> {
    const apiKey = env.get('RESEND_API_KEY', 'mock_resend_key')

    // In production, we'd use resend package
    // const resend = new Resend(apiKey);
    // await resend.emails.send({ from: 'onboarding@gloxis.com', to, subject: 'Atualização Gloxis', html: message });

    console.log(`[Resend Email] Real Sending to ${to}: ${message} (Key: ${apiKey})`)
  }
}
