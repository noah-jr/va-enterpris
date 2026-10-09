
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    if (!process.env.SMTP_USER) {
        console.log(`[Mock Email] To: ${to}, Subject: ${subject}`);
        return;
    }

    await transporter.sendMail({
        from: process.env.SMTP_FROM || '"VA Tech" <noreply@vatech.com>',
        to,
        subject,
        html,
    });
};
