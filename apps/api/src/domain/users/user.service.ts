import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma/prisma.service';
import { SecurityLogService } from '../../infrastructure/security/log.service';
import { EmailService } from '../../integrations/email/email.service';
import { SecurityDetectorService } from '../../infrastructure/security/detector.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { RedisService } from '../../core/cache/redis.service';
import { S3Service } from '../../shared/services/s3.service';
import { generateSecret, generateURI, verifySync } from 'otplib';
import * as qrcode from 'qrcode';
import {
  UpdateProfileDto,
  SessionResponseDto,
  ChangeEmailDto,
  UpdateSecurityPreferencesDto,
} from './dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    private securityLogService: SecurityLogService,
    private emailService: EmailService,
    private securityDetectorService: SecurityDetectorService,
    private notificationsGateway: NotificationsGateway,
    private redisService: RedisService,
    private s3Service: S3Service,
  ) {}

  // Get user profile
  async getProfile(userId: string) {
    const cacheKey = `user:profile:${userId}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) return cached;

    const result = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        twoFactorEnabled: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            name: true,
            username: true,
            avatar: true,
            bio: true,
            coverImage: true,
          },
        },
      },
    });

    await this.redisService.set(cacheKey, result, 60);
    return result;
  }

  // Update user profile
  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    // Check if email is being changed and if it's already in use
    if (updateData.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Email already in use');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        phone: updateData.phone,
        updatedAt: new Date(),
        profile:
          updateData.name || updateData.avatar
            ? {
                update: {
                  ...(updateData.name && { name: updateData.name }),
                  ...(updateData.avatar && { avatar: updateData.avatar }),
                },
              }
            : undefined,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        twoFactorEnabled: true,
        emailVerified: true,
        profile: {
          select: {
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Log profile update
    const changes = Object.keys(updateData).join(', ');
    await this.securityLogService.createLog({
      userId,
      action: 'PROFILE_UPDATE',
      status: 'SUCCESS',
      description: `تحديث الملف الشخصي: ${changes}`,
    });

    // إرسال إشعار بتحديث الملف الشخصي
    await this.notificationsGateway.sendNotification({
      userId,
      type: 'SYSTEM',
      title: 'تم تحديث الملف الشخصي',
      message: `تم تحديث بياناتك الشخصية بنجاح: ${changes}`,
    });

    return updatedUser;
  }

  // Setup 2FA - Step 1: Generate QR Code
  async setup2FA(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate secret using otplib
    const secret = generateSecret();
    const otpauthUrl = generateURI({ issuer: 'Rukny.io', label: user.email, secret });

    // Save secret temporarily (not enabled yet)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        updatedAt: new Date(),
      },
      select: { id: true, twoFactorSecret: true },
    });

    // Generate QR Code
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

    return {
      secret: secret,
      qrCode: qrCodeUrl,
    };
  }

  // Verify 2FA - Step 2: Verify code and enable
  async verify2FA(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          select: { name: true },
        },
      },
    });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA setup not initiated');
    }

    // Verify code using otplib
    const result = verifySync({ token: code, secret: user.twoFactorSecret });

    if (!result.valid) {
      // Log failed 2FA verification
      await this.securityLogService.createLog({
        userId,
        action: 'TWO_FA_VERIFIED',
        status: 'FAILED',
        description: `محاولة فاشلة للتحقق من رمز 2FA`,
      });
      throw new BadRequestException('Invalid verification code');
    }

    // Enable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        updatedAt: new Date(),
      },
      select: { id: true, twoFactorEnabled: true },
    });

    // Log 2FA enabled
    await this.securityLogService.createLog({
      userId,
      action: 'TWO_FA_ENABLED',
      status: 'SUCCESS',
      description: `تم تفعيل المصادقة الثنائية`,
    });

    // إرسال إشعار بتفعيل المصادقة الثنائية
    await this.notificationsGateway.sendNotification({
      userId,
      type: 'TWO_FACTOR_ENABLED',
      title: 'تم تفعيل المصادقة الثنائية ✅',
      message:
        'تم تفعيل المصادقة الثنائية على حسابك بنجاح. حسابك الآن أكثر أماناً!',
    });

    // Send email notification
    await this.emailService.sendSecurityAlert(
      user.email,
      user.profile?.name || 'مستخدم',
      {
        action: 'TWO_FA_ENABLED',
        actionArabic: 'تفعيل المصادقة الثنائية',
        description: 'تم تفعيل المصادقة الثنائية على حسابك بنجاح',
        timestamp: new Date(),
      },
    );

    return { message: '2FA enabled successfully' };
  }

  // Disable 2FA
  async disable2FA(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          select: { name: true },
        },
      },
    });

    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify code before disabling using otplib
    const result = verifySync({ token: code, secret: user.twoFactorSecret });

    if (!result.valid) {
      // Log failed 2FA disable attempt
      await this.securityLogService.createLog({
        userId,
        action: 'TWO_FA_DISABLED',
        status: 'FAILED',
        description: `محاولة فاشلة لتعطيل المصادقة الثنائية - رمز خاطئ`,
      });
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        updatedAt: new Date(),
      },
      select: { id: true, twoFactorEnabled: true, twoFactorSecret: true },
    });

    // Log 2FA disabled
    await this.securityLogService.createLog({
      userId,
      action: 'TWO_FA_DISABLED',
      status: 'SUCCESS',
      description: `تم تعطيل المصادقة الثنائية`,
    });

    // إرسال إشعار بتعطيل المصادقة الثنائية
    await this.notificationsGateway.sendNotification({
      userId,
      type: 'TWO_FACTOR_DISABLED',
      title: 'تم تعطيل المصادقة الثنائية ⚠️',
      message:
        'تم تعطيل المصادقة الثنائية على حسابك. ننصحك بإعادة تفعيلها لمزيد من الأمان.',
    });

    // Send email notification
    await this.emailService.sendSecurityAlert(
      user.email,
      user.profile?.name || 'مستخدم',
      {
        action: 'TWO_FA_DISABLED',
        actionArabic: 'تعطيل المصادقة الثنائية',
        description: 'تم تعطيل المصادقة الثنائية على حسابك',
        timestamp: new Date(),
      },
    );

    return { message: '2FA disabled successfully' };
  }

  // Get all active sessions for user
  // currentSessionId يُستخرج من JWT (payload.sid)
  async getSessions(
    userId: string,
    currentSessionId?: string,
  ): Promise<SessionResponseDto[]> {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        isRevoked: false,
      },
      orderBy: {
        lastActivity: 'desc',
      },
    });

    return sessions.map((session) => ({
      id: session.id,
      deviceName: session.deviceName,
      deviceType: session.deviceType,
      browser: session.browser,
      os: session.os,
      ipAddress: session.ipAddress,
      location: session.location,
      lastActivity: session.lastActivity,
      createdAt: session.createdAt,
      isCurrent: !!currentSessionId && session.id === currentSessionId,
    }));
  }

  // Delete specific session (logout from device)
  async deleteSession(
    userId: string,
    sessionId: string,
    currentSessionId?: string,
  ) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new BadRequestException('Session not found');
    }

    if (currentSessionId && session.id === currentSessionId) {
      throw new BadRequestException('Cannot delete current session');
    }

    // Revoke instead of delete for audit trail
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: 'User deleted session',
      },
    });

    // Log session deletion
    await this.securityLogService.createLog({
      userId,
      action: 'SESSION_DELETED',
      status: 'SUCCESS',
      description: `تم حذف جلسة: ${session.deviceName || session.deviceType}`,
      ipAddress: session.ipAddress,
      deviceType: session.deviceType,
      browser: session.browser,
      os: session.os,
    });

    return { message: 'Session deleted successfully' };
  }

  // Delete all other sessions (logout from all other devices)
  async deleteOtherSessions(userId: string, currentSessionId?: string) {
    // Revoke all sessions except current
    const result = await this.prisma.session.updateMany({
      where: {
        userId,
        isRevoked: false,
        ...(currentSessionId ? { id: { not: currentSessionId } } : {}),
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: 'User logged out from all other devices',
      },
    });

    // Log session deletion
    await this.securityLogService.createLog({
      userId,
      action: 'SESSION_DELETED_ALL',
      status: 'SUCCESS',
      description: `تم إنهاء جميع الجلسات الأخرى (${result.count} جلسات)`,
    });

    return {
      message: 'All other sessions deleted successfully',
      deletedCount: result.count,
    };
  }

  // Change Email (بدون كلمة مرور - يتم التحقق عبر رمز مرسل للبريد)
  async changeEmail(
    userId: string,
    changeEmailDto: ChangeEmailDto,
    ipAddress?: string,
    browser?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          select: { name: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if new email is already in use
    const existingUser = await this.prisma.user.findUnique({
      where: { email: changeEmailDto.newEmail },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const oldEmail = user.email;
    const newEmail = changeEmailDto.newEmail;

    // Update email
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        emailVerified: false, // Require re-verification
        updatedAt: new Date(),
      },
      select: { id: true, email: true, emailVerified: true },
    });

    // Log email change
    await this.securityLogService.createLog({
      userId,
      action: 'EMAIL_CHANGE',
      status: 'SUCCESS',
      description: `تم تغيير البريد الإلكتروني من ${oldEmail} إلى ${newEmail}`,
      ipAddress,
      browser,
    });

    // Send email alerts to both old and new email
    await this.emailService.sendEmailChangeAlert(
      oldEmail,
      newEmail,
      user.profile?.name || 'مستخدم',
      {
        ipAddress,
        browser,
        timestamp: new Date(),
      },
    );

    return {
      message: 'Email changed successfully',
      oldEmail,
      newEmail,
    };
  }

  // Get Security Preferences
  async getSecurityPreferences(userId: string) {
    return this.securityDetectorService.getPreferences(userId);
  }

  // Update Security Preferences
  async updateSecurityPreferences(
    userId: string,
    dto: UpdateSecurityPreferencesDto,
  ) {
    return this.securityDetectorService.updatePreferences(userId, dto);
  }

  // Get Security Alert Settings (mapped from preferences)
  async getSecurityAlertSettings(userId: string) {
    const prefs = await this.securityDetectorService.getPreferences(userId);

    return {
      emailNotifications: true, // Always enabled at the system level
      loginAlerts: prefs.emailOnFailedLogin || false,
      newDeviceAlerts: prefs.emailOnNewDevice || false,
      suspiciousActivityAlerts: prefs.emailOnSuspiciousActivity || false,
      passwordChangeAlerts: prefs.emailOnPasswordChange || false,
      twoFactorAlerts: prefs.emailOn2FAChange || false,
      sessionManagementAlerts: true, // Default enabled
      ipBlocklistAlerts: prefs.autoBlockSuspiciousIp || false,
    };
  }

  // Update Security Alert Settings (maps to preferences)
  async updateSecurityAlertSettings(userId: string, settings: any) {
    const updateDto: UpdateSecurityPreferencesDto = {};

    if (settings.loginAlerts !== undefined) {
      updateDto.emailOnFailedLogin = settings.loginAlerts;
    }
    if (settings.newDeviceAlerts !== undefined) {
      updateDto.emailOnNewDevice = settings.newDeviceAlerts;
    }
    if (settings.suspiciousActivityAlerts !== undefined) {
      updateDto.emailOnSuspiciousActivity = settings.suspiciousActivityAlerts;
    }
    if (settings.passwordChangeAlerts !== undefined) {
      updateDto.emailOnPasswordChange = settings.passwordChangeAlerts;
    }
    if (settings.twoFactorAlerts !== undefined) {
      updateDto.emailOn2FAChange = settings.twoFactorAlerts;
    }
    if (settings.ipBlocklistAlerts !== undefined) {
      updateDto.autoBlockSuspiciousIp = settings.ipBlocklistAlerts;
    }

    await this.securityDetectorService.updatePreferences(userId, updateDto);

    return this.getSecurityAlertSettings(userId);
  }

  // Get Trusted Devices
  async getTrustedDevices(userId: string) {
    return this.securityDetectorService.getTrustedDevices(userId);
  }

  // Remove Trusted Device
  async removeTrustedDevice(userId: string, deviceId: string) {
    return this.securityDetectorService.removeTrustedDevice(userId, deviceId);
  }

  // ─── Verification Requests ──────────────────────────

  /**
   * Get the user's latest verification request
   */
  async getVerificationRequest(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true, verifiedAt: true },
    });

    const latestRequest = await this.prisma.verificationRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        status: true,
        fullName: true,
        socialLinks: true,
        screenshots: true,
        businessName: true,
        businessEmail: true,
        notes: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate presigned URLs for S3 screenshot keys
    let screenshotUrls: string[] = latestRequest?.screenshots || [];
    if (latestRequest?.screenshots?.length) {
      const isS3Keys = !latestRequest.screenshots[0]?.startsWith('data:');
      if (isS3Keys) {
        const bucket = this.s3Service.getDefaultBucket();
        screenshotUrls = await this.s3Service.getPresignedGetUrls(
          bucket,
          latestRequest.screenshots,
          3600, // 1 hour
        );
      }
    }

    return {
      isVerified: user?.isVerified || false,
      verifiedAt: user?.verifiedAt || null,
      request: latestRequest
        ? { ...latestRequest, screenshots: screenshotUrls }
        : null,
    };
  }

  /**
   * Submit a verification request
   */
  async submitVerificationRequest(
    userId: string,
    body: {
      type: 'PERSONAL' | 'BUSINESS';
      fullName: string;
      socialLinks?: string;
      businessName?: string;
      businessEmail?: string;
      notes?: string;
    },
    files?: Express.Multer.File[],
  ) {
    // Check if user is already verified
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true, email: true },
    });
    if (!user) throw new BadRequestException('المستخدم غير موجود');
    if (user.isVerified) throw new BadRequestException('الحساب موثق بالفعل');

    // Check if there's a pending request
    const existingPending = await this.prisma.verificationRequest.findFirst({
      where: {
        userId,
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
    });
    if (existingPending) {
      throw new BadRequestException('لديك طلب توثيق قيد المراجعة بالفعل');
    }

    if (!body.fullName || body.fullName.trim().length < 2) {
      throw new BadRequestException('الاسم الكامل مطلوب');
    }

    // Parse social links
    let socialLinks: any = null;
    if (body.socialLinks) {
      try {
        socialLinks = JSON.parse(body.socialLinks);
      } catch {
        socialLinks = null;
      }
    }

    // For personal verification, require at least one screenshot or social link
    if (body.type === 'PERSONAL') {
      const hasScreenshots = files && files.length > 0;
      const hasSocialLinks = socialLinks && Array.isArray(socialLinks) && socialLinks.length > 0;
      if (!hasScreenshots && !hasSocialLinks) {
        throw new BadRequestException('يجب رفع صور أو إضافة روابط منصات التواصل الاجتماعي');
      }
    }

    // For business verification, require business name
    if (body.type === 'BUSINESS' && !body.businessName?.trim()) {
      throw new BadRequestException('اسم الشركة مطلوب للتوثيق التجاري');
    }

    // Upload screenshots to S3
    const screenshots: string[] = [];
    if (files && files.length > 0) {
      const bucket = this.s3Service.getDefaultBucket();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.originalname?.split('.').pop() || 'jpg';
        const key = `verification/${userId}/${Date.now()}-${i}.${ext}`;
        try {
          await this.s3Service.uploadBuffer(bucket, key, file.buffer, file.mimetype);
          screenshots.push(key);
        } catch (err) {
          this.logger.error(`Failed to upload verification screenshot: ${err}`);
          throw new BadRequestException('فشل رفع الصور، حاول مرة أخرى');
        }
      }
    }

    const request = await this.prisma.verificationRequest.create({
      data: {
        userId,
        type: body.type as any,
        fullName: body.fullName.trim(),
        socialLinks,
        screenshots,
        businessName: body.businessName?.trim() || null,
        businessEmail: body.businessEmail?.trim() || null,
        notes: body.notes?.trim() || null,
      },
      select: {
        id: true,
        type: true,
        status: true,
        fullName: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      message: 'تم تقديم طلب التوثيق بنجاح. سيتم مراجعته قريباً.',
      request,
    };
  }
}
