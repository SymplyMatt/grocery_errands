import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export interface EmailOptions {
  to: string[];
  subject: string;
  html?: string;
  text?: string;
}

export async function sendEmail(emailOptions: EmailOptions): Promise<void> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_PASSWORD;
  const from = user;

  if (!host || !user || !pass || !from) {
    console.error('Missing required environment variables');
    return;
  }

  try {
    const transporter: Transporter = nodemailer.createTransport({
      host,
      port: 465,
      secure: true,
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from : from,
      to: emailOptions.to.join(','),
      subject: emailOptions.subject,
      html: emailOptions.html,
      text: emailOptions.text,
    });
    console.log(info);
  } catch (error) {
    console.error('Error occurred while sending email:', error);
  }
}
