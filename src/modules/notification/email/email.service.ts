import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly defaultFrom: string;
  private readonly isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('email.resendApiKey');
    this.defaultFrom = this.configService.get<string>('email.from') ?? 'noreply@inntexia.com';
    this.isEnabled = !!apiKey && apiKey !== 'your-resend-api-key';

    if (this.isEnabled) {
      this.resend = new Resend(apiKey);
      this.logger.log('Email service initialized with Resend');
    } else {
      this.logger.warn('Email service disabled - no API key configured');
    }
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    if (!this.isEnabled) {
      const toStr = Array.isArray(options.to) ? options.to.join(', ') : options.to;
      this.logger.warn(`Email not sent (disabled): ${options.subject} to ${toStr}`);
      return {
        success: true,
        messageId: 'disabled',
      };
    }

    try {
      const result = await this.resend.emails.send({
        from: options.from ?? this.defaultFrom,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      });

      if (result.error) {
        this.logger.error(`Email send failed: ${result.error.message}`);
        return {
          success: false,
          error: result.error.message,
        };
      }

      const toStr = Array.isArray(options.to) ? options.to.join(', ') : options.to;
      this.logger.log(`Email sent: ${options.subject} to ${toStr}`);
      return {
        success: true,
        messageId: result.data?.id,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Email send error: ${message}`);
      return {
        success: false,
        error: message,
      };
    }
  }

  // ========== Email Templates ==========

  async sendWelcomeEmail(to: string, name: string): Promise<EmailResult> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Inntexia Academy!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Welcome to Inntexia Academy! We're excited to have you join our learning community.</p>
            <p>Your account has been created successfully. You can now:</p>
            <ul>
              <li>Browse our course catalog</li>
              <li>Enroll in classes</li>
              <li>Track your learning progress</li>
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Happy learning!</p>
            <p>The Inntexia Academy Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to,
      subject: 'Welcome to Inntexia Academy!',
      html,
    });
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    verificationToken: string,
  ): Promise<EmailResult> {
    const verificationUrl = `${this.configService.get<string>('app.frontendUrl')}/verify-email?token=${verificationToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
          .code { background: #e5e7eb; padding: 8px 16px; font-family: monospace; font-size: 18px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Please verify your email address by clicking the button below:</p>
            <p><a href="${verificationUrl}" class="button">Verify Email</a></p>
            <p>Or copy this link to your browser:</p>
            <p style="word-break: break-all;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to,
      subject: 'Verify Your Email - Inntexia Academy',
      html,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetToken: string,
  ): Promise<EmailResult> {
    const resetUrl = `${this.configService.get<string>('app.frontendUrl')}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p><a href="${resetUrl}" class="button">Reset Password</a></p>
            <p>Or copy this link to your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p><strong>If you didn't request this, please ignore this email.</strong> Your password will remain unchanged.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to,
      subject: 'Reset Your Password - Inntexia Academy',
      html,
    });
  }

  async sendLessonUnlockedEmail(
    to: string,
    name: string,
    lessonTitle: string,
    courseTitle: string,
    className: string,
  ): Promise<EmailResult> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .highlight { background: #D1FAE5; padding: 12px; border-radius: 6px; margin: 12px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Lesson Unlocked!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Great news! A new lesson has been unlocked in your class:</p>
            <div class="highlight">
              <strong>Lesson:</strong> ${lessonTitle}<br>
              <strong>Course:</strong> ${courseTitle}<br>
              <strong>Class:</strong> ${className}
            </div>
            <p>Log in to start learning!</p>
            <p>Happy learning!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to,
      subject: `New Lesson Unlocked: ${lessonTitle} - Inntexia Academy`,
      html,
    });
  }

  async sendAssignmentGradedEmail(
    to: string,
    name: string,
    exerciseTitle: string,
    score: number,
    maxScore: number,
    feedback: string | null,
  ): Promise<EmailResult> {
    const percentage = Math.round((score / maxScore) * 100);
    const isPassing = percentage >= 70;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${isPassing ? '#059669' : '#F59E0B'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .grade-box { background: ${isPassing ? '#D1FAE5' : '#FEF3C7'}; padding: 16px; border-radius: 6px; margin: 12px 0; text-align: center; }
          .grade { font-size: 32px; font-weight: bold; color: ${isPassing ? '#059669' : '#D97706'}; }
          .feedback { background: #e5e7eb; padding: 12px; border-radius: 6px; margin: 12px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Assignment Graded!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Your assignment "${exerciseTitle}" has been graded:</p>
            <div class="grade-box">
              <div class="grade">${score}/${maxScore}</div>
              <div>${percentage}%</div>
            </div>
            ${feedback ? `<div class="feedback"><strong>Feedback:</strong><br>${feedback}</div>` : ''}
            <p>Keep up the great work!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to,
      subject: `Assignment Graded: ${exerciseTitle} (${percentage}%) - Inntexia Academy`,
      html,
    });
  }

  async sendPaymentConfirmationEmail(
    to: string,
    name: string,
    courseTitle: string,
    amount: number,
    paymentRef: string,
  ): Promise<EmailResult> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .receipt { background: white; padding: 16px; border: 1px solid #e5e7eb; border-radius: 6px; margin: 12px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Your payment has been verified. Thank you for your purchase!</p>
            <div class="receipt">
              <strong>Course:</strong> ${courseTitle}<br>
              <strong>Amount:</strong> Rp ${amount.toLocaleString('id-ID')}<br>
              <strong>Reference:</strong> ${paymentRef}
            </div>
            <p>You can now access your enrolled class. Happy learning!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.send({
      to,
      subject: `Payment Confirmed: ${courseTitle} - Inntexia Academy`,
      html,
    });
  }
}

