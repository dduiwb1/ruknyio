import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma/prisma.service';
import { EmailService } from '../../../integrations/email/email.service';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

@Injectable()
export class FormEmailVerificationService {
  private readonly logger = new Logger(FormEmailVerificationService.name);
  private readonly VERIFICATION_CODE_LENGTH = 6;
  private readonly VERIFICATION_CODE_EXPIRY = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_ATTEMPTS = 3;

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate a random 6-digit verification code
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send verification code to email
   */
  async sendVerificationCode(
    formId: string,
    fieldId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ success: boolean; message: string; expiresIn: number }> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Check if form exists
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        fields: {
          where: { id: fieldId },
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (form.fields.length === 0 || form.fields[0].type !== 'EMAIL') {
      throw new BadRequestException('Invalid email field');
    }

    // Clean up expired verifications
    await this.prisma.formEmailVerification.deleteMany({
      where: {
        formId,
        expiresAt: { lt: new Date() },
      },
    });

    // Check if there's already an active verification for this email
    const existingVerification = await this.prisma.formEmailVerification.findFirst({
      where: {
        formId,
        email,
        verified: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingVerification && existingVerification.attempts >= this.MAX_ATTEMPTS) {
      throw new BadRequestException(
        'Too many verification attempts. Please try again later.',
      );
    }

    // Generate code
    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + this.VERIFICATION_CODE_EXPIRY);

    // Save verification code
    const verification = await this.prisma.formEmailVerification.create({
      data: {
        formId,
        fieldId,
        email,
        code,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    // Send email with verification code
    try {
      await this.emailService.sendEmail({
        to: email,
        subject: 'رمز التحقق من البريد الإلكتروني - Rukny Forms',
        html: this.getVerificationEmailTemplate(code, form.title),
      });

      this.logger.log(
        `Verification code sent to ${email} for form ${formId}`,
      );

      return {
        success: true,
        message: 'Verification code sent to your email',
        expiresIn: this.VERIFICATION_CODE_EXPIRY / 1000, // in seconds
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send verification email: ${message}`);
      // Delete verification record if email sending failed
      await this.prisma.formEmailVerification.delete({
        where: { id: verification.id },
      });
      throw new BadRequestException('Failed to send verification code');
    }
  }

  /**
   * Verify the code provided by user
   */
  async verifyCode(
    formId: string,
    email: string,
    code: string,
    ipAddress?: string,
  ): Promise<{ success: boolean; message: string }> {
    // Find verification record
    const verification = await this.prisma.formEmailVerification.findFirst({
      where: {
        formId,
        email,
        verified: false,
      },
    });

    if (!verification) {
      throw new BadRequestException('No active verification found for this email');
    }

    // Check if expired
    if (new Date() > verification.expiresAt) {
      await this.prisma.formEmailVerification.delete({
        where: { id: verification.id },
      });
      throw new BadRequestException('Verification code has expired');
    }

    // Check attempts
    if (verification.attempts >= this.MAX_ATTEMPTS) {
      throw new BadRequestException(
        'Too many verification attempts. Please request a new code.',
      );
    }

    // Verify code
    if (verification.code !== code) {
      // Increment attempts
      await this.prisma.formEmailVerification.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });

      const remainingAttempts = this.MAX_ATTEMPTS - verification.attempts - 1;
      throw new BadRequestException(
        `Invalid verification code. ${remainingAttempts} attempts remaining.`,
      );
    }

    // Mark as verified
    await this.prisma.formEmailVerification.update({
      where: { id: verification.id },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });

    this.logger.log(`Email ${email} verified for form ${formId}`);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  /**
   * Check if email is verified for a form
   */
  async isEmailVerified(
    formId: string,
    email: string,
  ): Promise<boolean> {
    const verification = await this.prisma.formEmailVerification.findFirst({
      where: {
        formId,
        email,
        verified: true,
      },
    });

    return !!verification;
  }

  /**
   * Clean up old verification codes (should be run by cron job)
   */
  async cleanupExpiredVerifications(): Promise<number> {
    const result = await this.prisma.formEmailVerification.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    this.logger.debug(`Cleaned up ${result.count} expired verification codes`);
    return result.count;
  }

  /**
   * Get verification email template
   */
  private getVerificationEmailTemplate(code: string, formTitle: string): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
            direction: rtl;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #6366f1;
            margin-bottom: 10px;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 30px;
          }
          .form-title {
            background-color: #f0f0f0;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 30px;
            text-align: center;
            color: #333;
          }
          .code-section {
            text-align: center;
            margin: 30px 0;
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #6366f1;
            background-color: #f0f0f0;
            padding: 20px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
          }
          .expiry {
            font-size: 12px;
            color: #999;
            margin-top: 15px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 12px;
            color: #999;
          }
          .warning {
            background-color: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
            font-size: 13px;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Rukny Forms</div>
            <div class="title">تحقق من بريدك الإلكتروني</div>
            <div class="subtitle">Verify Your Email Address</div>
          </div>

          <div class="form-title">
            <strong>النموذج:</strong> ${this.escapeHtml(formTitle)}
          </div>

          <p style="text-align: right; color: #333; line-height: 1.6;">
            شكراً لاستخدامك Rukny Forms. لإكمال تقديم النموذج، يرجى التحقق من عنوان بريدك الإلكتروني باستخدام الرمز أدناه:
          </p>

          <div class="code-section">
            <div class="code">${this.escapeHtml(code)}</div>
            <div class="expiry">
              صالح لمدة 15 دقيقة من الآن
            </div>
          </div>

          <div class="warning">
            <strong>⚠️ تحذير أمني:</strong>
            <p style="margin: 5px 0 0 0;">
              لا تشارك هذا الرمز مع أحد. فريق Rukny لن يطلب منك أبداً رمزك عبر البريد الإلكتروني.
            </p>
          </div>

          <p style="text-align: right; color: #666; font-size: 13px; margin-top: 20px;">
            إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.
          </p>

          <div class="footer">
            <p style="margin: 5px 0;">
              © ${new Date().getFullYear()} Rukny. جميع الحقوق محفوظة.
            </p>
            <p style="margin: 5px 0;">
              <a href="https://rukny.io" style="color: #6366f1; text-decoration: none;">Rukny.io</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Escape HTML characters to prevent XSS
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
