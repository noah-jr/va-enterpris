// ============================================================
// IEmailService — Email sending contract
// ============================================================

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IEmailService {
  send(params: SendEmailParams): Promise<void>;
  /** Ativação de conta de cliente: link + código de 6 dígitos. */
  sendEmailVerification(params: {
    to: string;
    name: string;
    verificationUrl: string;
    code: string;
    expiresInHours: number;
  }): Promise<void>;
  /** Recuperação de senha (clientes e utilizadores internos): link + código de 6 dígitos. */
  sendPasswordReset(params: {
    to: string;
    name: string;
    resetUrl: string;
    code: string;
    expiresInMinutes: number;
  }): Promise<void>;
  /** Convite a um utilizador interno para definir a sua senha. */
  sendUserInvitation(params: {
    to: string;
    name: string;
    inviteUrl: string;
    code: string;
    expiresInHours: number;
    invitedBy: string;
  }): Promise<void>;
  sendTestEmail(params: {
    to: string;
    requestedBy: string;
    type?: 'GENERIC' | 'ACCOUNT_VERIFICATION' | 'PASSWORD_RESET';
    code?: string;
  }): Promise<void>;
  sendDocumentStatusChanged(params: {
    to: string;
    name: string;
    documentTitle: string;
    newStatus: string;
    platformUrl: string;
  }): Promise<void>;
  sendDocumentRequest(params: {
    to: string;
    name: string;
    documentTitle: string;
    requestedItems: string[];
    platformUrl: string;
  }): Promise<void>;
}
