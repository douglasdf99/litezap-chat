import sgMail from '@sendgrid/mail';

import dotenv from 'dotenv';
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async ({ to, subject, text, html }: EmailOptions): Promise<void> => {
  const msg = {
    to,
    from: 'noreply@litezap.com',
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('Email enviado com sucesso');
  } catch (error: any) {
    console.error('Erro ao enviar email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};
