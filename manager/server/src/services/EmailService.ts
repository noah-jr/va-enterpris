import nodemailer from 'nodemailer';

export class EmailService {
    private static transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    /**
     * Envia um código OTP para verificação de email.
     */
    static async sendVerificationOTP(email: string, name: string, otpCode: string): Promise<void> {
        const mailOptions = {
            from: `"VA ONEGEST" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Verificação de Conta - VA ONEGEST',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                    <h2 style="color: #4f46e5; text-align: center;">Bem-vindo ao VA ONEGEST!</h2>
                    <p style="font-size: 16px; color: #333;">Olá <strong>${name}</strong>,</p>
                    <p style="font-size: 16px; color: #333;">Obrigado por se registar. Para ativar a sua conta, insira o seguinte código de verificação no sistema:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; background-color: #f3f4f6; padding: 15px 30px; border-radius: 8px;">
                            ${otpCode}
                        </span>
                    </div>
                    <p style="font-size: 14px; color: #666;">Este código é válido por tempo limitado. Se não solicitou esta verificação, por favor ignore este email.</p>
                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">VA ONEGEST - Sistema de Gestão Empresarial</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`[EmailService] OTP enviado com sucesso para ${email}`);
        } catch (error) {
            console.error(`[EmailService] Erro ao enviar OTP para ${email}:`, error);
            throw new Error('Não foi possível enviar o email de verificação.');
        }
    }

    /**
     * Envia um link de verificação.
     */
    static async sendVerificationLink(email: string, name: string, token: string): Promise<void> {
        const verifyLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}&email=${email}`;
        
        const mailOptions = {
            from: `"VA ONEGEST" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Confirme o seu email - VA ONEGEST',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                    <h2 style="color: #4f46e5; text-align: center;">Ativação de Conta</h2>
                    <p style="font-size: 16px; color: #333;">Olá <strong>${name}</strong>,</p>
                    <p style="font-size: 16px; color: #333;">Para concluir o seu registo, por favor confirme o seu endereço de email clicando no botão abaixo:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verifyLink}" style="background-color: #4f46e5; color: white; text-decoration: none; padding: 14px 28px; font-size: 16px; border-radius: 6px; font-weight: bold; display: inline-block;">Verificar Email</a>
                    </div>
                    <p style="font-size: 14px; color: #666;">Ou copie o link abaixo e cole no seu navegador:</p>
                    <p style="font-size: 12px; color: #4f46e5; word-break: break-all;">${verifyLink}</p>
                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">VA ONEGEST - Sistema de Gestão Empresarial</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`[EmailService] Link enviado com sucesso para ${email}`);
        } catch (error) {
            console.error(`[EmailService] Erro ao enviar Link para ${email}:`, error);
            throw new Error('Não foi possível enviar o email de verificação.');
        }
    }

    /**
     * Envia um email de aprovação de subscrição.
     */
    static async sendSubscriptionApproval(
        email: string, 
        companyName: string, 
        planName: string, 
        billing: string, 
        endDate: string, 
        price: number,
        invoiceNumber?: string
    ): Promise<void> {
        const mailOptions = {
            from: `"VA ONEGEST" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Subscrição Aprovada - VA ONEGEST',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
                    <h2 style="color: #10b981; text-align: center;">Subscrição Aprovada!</h2>
                    <p style="font-size: 16px; color: #333;">Olá equipa da <strong>${companyName}</strong>,</p>
                    <p style="font-size: 16px; color: #333;">O seu pedido de subscrição foi aprovado com sucesso. A sua empresa já tem acesso aos módulos correspondentes.</p>
                    
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Plano:</strong> ${planName}</p>
                        <p style="margin: 5px 0;"><strong>Ciclo de Faturação:</strong> ${billing}</p>
                        <p style="margin: 5px 0;"><strong>Válido até:</strong> ${endDate}</p>
                        <p style="margin: 5px 0;"><strong>Valor Pago:</strong> ${price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</p>
                        ${invoiceNumber ? `<p style="margin: 5px 0;"><strong>Fatura:</strong> ${invoiceNumber}</p>` : ''}
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background-color: #4f46e5; color: white; text-decoration: none; padding: 14px 28px; font-size: 16px; border-radius: 6px; font-weight: bold; display: inline-block;">Aceder ao Portal</a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #999; text-align: center;">VA ONEGEST - Sistema de Gestão Empresarial</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`[EmailService] Email de subscrição aprovada enviado para ${email}`);
        } catch (error) {
            console.error(`[EmailService] Erro ao enviar email de subscrição para ${email}:`, error);
        }
    }
}
