import { Resend } from 'resend';
import { render } from '@react-email/render';
import { NotificationEmail } from './templates/notification-email';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  template?: 'notification' | 'welcome' | 'reset-password';
  data?: Record<string, any>;
}

export async function sendEmail(options: EmailOptions) {
  try {
    let html = options.text;

    // Use React Email templates if specified
    if (options.template === 'notification') {
      html = render(NotificationEmail({
        title: options.subject,
        message: options.text,
        ...options.data
      }));
    }

    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'notifications@yourdomain.com',
      to: options.to,
      subject: options.subject,
      html: html,
      text: options.text,
    });

    console.log('Email sent:', data.id);
    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
} 