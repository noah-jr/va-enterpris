import nodemailer from 'nodemailer';
import type { IEmailService, SendEmailParams } from '../../application/contracts/index.js';
import { button, codeBox, escapeHtml, layout, note, paragraph } from './email-templates.js';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

/** Devolve a configuração SMTP em vigor (painel de administração ou variáveis de ambiente). */
export type SmtpConfigResolver = () => Promise<SmtpConfig>;

export class NodemailerEmailService implements IEmailService {
  private cached: { key: string; transporter: nodemailer.Transporter } | null = null;

  constructor(private readonly resolveConfig: SmtpConfigResolver) {}

  /** Reutiliza o transporter enquanto a configuração não mudar. */
  private transporterFor(config: SmtpConfig): nodemailer.Transporter {
    const key = JSON.stringify([config.host, config.port, config.secure, config.user, config.pass]);
    if (this.cached?.key !== key) {
      this.cached = {
        key,
        transporter: nodemailer.createTransport({
          host: config.host,
          port: config.port,
          secure: config.secure,
          auth: config.user ? { user: config.user, pass: config.pass } : undefined,
          connectionTimeout: 15_000,
          greetingTimeout: 10_000,
        }),
      };
    }
    return this.cached.transporter;
  }

  async send(params: SendEmailParams): Promise<void> {
    const config = await this.resolveConfig();
    await this.transporterFor(config).sendMail({
      from: { name: config.fromName, address: config.fromEmail },
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
  }

  async sendEmailVerification(params: {
    to: string;
    name: string;
    verificationUrl: string;
    code: string;
    expiresInHours: number;
  }): Promise<void> {
    await this.send({
      to: params.to,
      subject: 'Ative a sua conta — VA OneGest',
      text: `Olá ${params.name}, ative a sua conta em ${params.verificationUrl} ou use o código ${params.code}. Válido por ${params.expiresInHours} horas.`,
      html: layout({
        title: 'Ative a sua conta',
        preheader: `O seu código de ativação é ${params.code}`,
        body:
          paragraph(`Olá, <strong>${escapeHtml(params.name)}</strong>.`) +
          paragraph('Obrigado pelo registo. Para ativar a sua conta, clique no botão abaixo:') +
          button('Ativar Conta', params.verificationUrl) +
          paragraph('Ou introduza este código na página de ativação:') +
          codeBox(params.code) +
          note(
            `O link e o código são válidos durante ${params.expiresInHours} horas e só podem ser usados uma vez. ` +
              'Se não criou esta conta, ignore este email.',
          ),
      }),
    });
  }

  async sendPasswordReset(params: {
    to: string;
    name: string;
    resetUrl: string;
    code: string;
    expiresInMinutes: number;
  }): Promise<void> {
    await this.send({
      to: params.to,
      subject: 'Recuperação de senha — VA OneGest',
      text: `Olá ${params.name}, redefina a sua senha em ${params.resetUrl} ou use o código ${params.code}. Válido por ${params.expiresInMinutes} minutos.`,
      html: layout({
        title: 'Recuperação de senha',
        preheader: `O seu código de recuperação é ${params.code}`,
        body:
          paragraph(`Olá, <strong>${escapeHtml(params.name)}</strong>.`) +
          paragraph('Recebemos um pedido para redefinir a senha da sua conta.') +
          button('Redefinir Senha', params.resetUrl) +
          paragraph('Ou use este código na página de recuperação:') +
          codeBox(params.code) +
          note(
            `Válido durante <strong>${params.expiresInMinutes} minutos</strong>. ` +
              'Se não pediu esta recuperação, ignore este email — a sua senha atual continua válida.',
          ),
      }),
    });
  }

  async sendUserInvitation(params: {
    to: string;
    name: string;
    inviteUrl: string;
    code: string;
    expiresInHours: number;
    invitedBy: string;
  }): Promise<void> {
    await this.send({
      to: params.to,
      subject: 'Convite para o painel de gestão — VA OneGest',
      text: `Olá ${params.name}, foi convidado(a) por ${params.invitedBy}. Defina a sua senha em ${params.inviteUrl} ou use o código ${params.code}.`,
      html: layout({
        title: 'Bem-vindo(a) à equipa',
        preheader: 'Defina a sua senha para aceder ao painel de gestão',
        body:
          paragraph(`Olá, <strong>${escapeHtml(params.name)}</strong>.`) +
          paragraph(
            `<strong>${escapeHtml(params.invitedBy)}</strong> criou-lhe uma conta no painel de gestão. ` +
              'Para começar, defina a sua senha:',
          ) +
          button('Definir Senha', params.inviteUrl) +
          paragraph('Ou use este código:') +
          codeBox(params.code) +
          note(`O convite é válido durante ${params.expiresInHours} horas.`),
      }),
    });
  }

  async sendTestEmail(params: {
    to: string;
    requestedBy: string;
    type?: 'GENERIC' | 'ACCOUNT_VERIFICATION' | 'PASSWORD_RESET';
    code?: string;
  }): Promise<void> {
    const testCode = params.code ?? '842915';

    if (params.type === 'ACCOUNT_VERIFICATION') {
      await this.sendEmailVerification({
        to: params.to,
        name: 'Utilizador de Teste',
        verificationUrl: 'https://accountable.local/auth/verify-email?token=teste-simulado-ativacao',
        code: testCode,
        expiresInHours: 24,
      });
      return;
    }

    if (params.type === 'PASSWORD_RESET') {
      await this.sendPasswordReset({
        to: params.to,
        name: 'Utilizador de Teste',
        resetUrl: 'https://accountable.local/auth/reset-password?token=teste-simulado-recuperacao',
        code: testCode,
        expiresInMinutes: 15,
      });
      return;
    }

    await this.send({
      to: params.to,
      subject: 'Teste de configuração de email — VA OneGest',
      text: `Este é um email de teste enviado por ${params.requestedBy}. A configuração do servidor de email está a funcionar.`,
      html: layout({
        title: 'Configuração de email a funcionar',
        preheader: 'Email de teste do servidor de email',
        body:
          paragraph('Este é um email de teste enviado a partir do painel de configurações.') +
          paragraph(`Pedido por: <strong>${escapeHtml(params.requestedBy)}</strong>`) +
          note(`Data: ${escapeHtml(new Date().toLocaleString('pt-AO', { timeZone: 'Africa/Luanda' }))}`),
      }),
    });
  }

  async sendDocumentStatusChanged(params: {
    to: string;
    name: string;
    documentTitle: string;
    newStatus: string;
    platformUrl: string;
  }): Promise<void> {
    await this.send({
      to: params.to,
      subject: `Estado do documento atualizado — ${params.documentTitle}`,
      html: layout({
        title: 'Estado do processo atualizado',
        preheader: `${params.documentTitle}: ${params.newStatus}`,
        body:
          paragraph(`Olá, <strong>${escapeHtml(params.name)}</strong>.`) +
          paragraph(`O processo <strong>"${escapeHtml(params.documentTitle)}"</strong> passou para o estado:`) +
          `<p style="font-size:18px;font-weight:700;color:#0B3B66;margin:0 0 8px;">${escapeHtml(params.newStatus)}</p>` +
          button('Ver Processo', params.platformUrl),
      }),
    });
  }

  async sendDocumentRequest(params: {
    to: string;
    name: string;
    documentTitle: string;
    requestedItems: string[];
    platformUrl: string;
  }): Promise<void> {
    const itemsList = params.requestedItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('');

    await this.send({
      to: params.to,
      subject: `Documentos solicitados — ${params.documentTitle}`,
      html: layout({
        title: 'Documentos solicitados',
        preheader: `Pedido de documentos para ${params.documentTitle}`,
        body:
          paragraph(`Olá, <strong>${escapeHtml(params.name)}</strong>.`) +
          paragraph(
            `Foram solicitados documentos adicionais para o processo <strong>"${escapeHtml(params.documentTitle)}"</strong>:`,
          ) +
          `<ul style="color:#1F2937;font-size:15px;line-height:1.6;">${itemsList}</ul>` +
          button('Submeter Documentos', params.platformUrl),
      }),
    });
  }
}
