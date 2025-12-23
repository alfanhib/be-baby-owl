import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WhatsAppLinkOptions {
  phone: string;
  message: string;
}

export interface PurchaseMessageData {
  courseTitle: string;
  packageMeetings: number;
  userName?: string;
  userEmail?: string;
}

export interface ContinuePrivateMessageData {
  courseName: string;
  className: string;
  lessonsRemaining: number;
  userName?: string;
  userEmail?: string;
}

@Injectable()
export class WhatsAppService {
  private readonly defaultPhone: string;

  constructor(private readonly configService: ConfigService) {
    this.defaultPhone = this.configService.get<string>('WHATSAPP_PHONE', '');
  }

  /**
   * Generate a WhatsApp deep link (wa.me format)
   */
  generateLink(options: WhatsAppLinkOptions): string {
    const phone = this.cleanPhoneNumber(options.phone || this.defaultPhone);
    const encodedMessage = encodeURIComponent(options.message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
  }

  /**
   * Generate purchase intent message
   */
  generatePurchaseMessage(data: PurchaseMessageData): string {
    const userInfo =
      data.userName && data.userEmail
        ? `Name: ${data.userName}\nEmail: ${data.userEmail}\n`
        : '';

    return `Hi! I'm interested in:

${data.courseTitle}
Package: ${data.packageMeetings} meetings

${userInfo}Please send payment details.`;
  }

  /**
   * Generate continue as private class message
   */
  generateContinuePrivateMessage(data: ContinuePrivateMessageData): string {
    const userInfo =
      data.userName && data.userEmail
        ? `Name: ${data.userName}\nEmail: ${data.userEmail}\n`
        : '';

    return `Hi! I'd like to continue learning.

Course: ${data.courseName}
Group class: ${data.className} (completed)
Lessons remaining: ${data.lessonsRemaining}

${userInfo}Please send private class options.`;
  }

  /**
   * Generate purchase link for a course
   */
  generatePurchaseLink(data: PurchaseMessageData, phone?: string): string {
    const message = this.generatePurchaseMessage(data);
    return this.generateLink({
      phone: phone || this.defaultPhone,
      message,
    });
  }

  /**
   * Generate continue as private class link
   */
  generateContinuePrivateLink(
    data: ContinuePrivateMessageData,
    phone?: string,
  ): string {
    const message = this.generateContinuePrivateMessage(data);
    return this.generateLink({
      phone: phone || this.defaultPhone,
      message,
    });
  }

  /**
   * Get the configured WhatsApp phone number
   */
  getDefaultPhone(): string {
    return this.defaultPhone;
  }

  /**
   * Clean phone number (remove spaces, dashes, etc.)
   */
  private cleanPhoneNumber(phone: string): string {
    // Remove all non-numeric characters except leading +
    const cleaned = phone.replace(/[^0-9+]/g, '');
    // Remove leading + for wa.me format
    return cleaned.replace(/^\+/, '');
  }
}
