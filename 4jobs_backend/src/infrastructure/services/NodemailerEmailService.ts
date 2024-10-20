import nodemailer from 'nodemailer';
import { injectable } from 'inversify';  
import { IEmailService } from '../../domain/interfaces/services/IEmailService';

@injectable()  
export class NodemailerEmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST !,
      port: parseInt(process.env.SMTP_PORT!, 10),
      secure: true,  
      auth: {
        user: process.env.SMTP_USER !,
        pass: process.env.SMTP_PASS !,
      },
      tls: {
        rejectUnauthorized: false 
      },
      connectionTimeout: 120000,
      socketTimeout: 120000,
      logger: true,  
      debug: process.env.NODE_ENV === 'development',  
    });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM !,
        to,
        subject: 'Welcome to 4JOBS',
        text: `Hello ${name},\n\nWelcome to 4JOBS! We're excited to have you on board.`,
        html: `<h1>Welcome, ${name}!</h1><p>We're excited to have you on board.</p>`,
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Could not send welcome email');
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM !,
        to,
        subject: 'Password Reset Request',
        text: `Please use the following token to reset your password: ${resetToken}`,
        html: `<p>Please use the following token to reset your password: <strong>${resetToken}</strong></p>`,
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Could not send password reset email');
    }
  }
}
