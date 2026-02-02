import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../core/database/prisma/prisma.service';
import { RedisService } from '../../core/cache/redis.service';
import { QuickSignType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

/**
 * 🔒 QuickSign Service
 * 
 * خدمة Magic Link للدخول السريع بدون كلمة مرور
 * 
 * تحسينات أمنية:
 * - تخزين hash التوكن فقط (وليس التوكن نفسه) - ملاحظة: يحتاج تغيير في schema
 * - One-time use (استخدام مرة واحدة)
 * - Expiration قصيرة (15-30 دقيقة)
 * - Rate limiting على طلب الإرسال
 * - ⚡ تخزين مؤقت في Redis للأداء
 */
@Injectable()
export class QuickSignService {
  // 🔒 15 دقيقة - أقصر للأمان
  private readonly QUICKSIGN_EXPIRY_MINUTES = 15;
  private readonly CACHE_PREFIX = 'quicksign:';
  private readonly USER_CACHE_PREFIX = 'user:exists:';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redis: RedisService,
  ) {}

  /**
   * 🔒 تشفير التوكن باستخدام SHA-256
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * 🔒 إنشاء QuickSign link جديد
   * ⚡ محسّن للأداء - يستخدم Redis cache + DB في الخلفية
   */
  async generateQuickSign(
    email: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ token: string; type: QuickSignType; expiresIn: number }> {
    // ⚡ التحقق من cache أولاً للمستخدم
    const cacheKey = `${this.USER_CACHE_PREFIX}${email}`;
    const cachedUser = await this.redis.get(cacheKey);
    let existingUser: { id: string; email: string; profileCompleted: boolean } | null = null;
    
    if (cachedUser) {
      existingUser = JSON.parse(cachedUser);
    } else {
      // لم يوجد في الـ cache - نبحث في الـ DB
      existingUser = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, profileCompleted: true },
      });
      // تخزين النتيجة في cache لمدة 5 دقائق
      await this.redis.set(cacheKey, JSON.stringify(existingUser), 300);
    }

    const type: QuickSignType = existingUser ? QuickSignType.LOGIN : QuickSignType.SIGNUP;

    // 🔒 إنشاء token فريد (JWT + UUID)
    const uuid = uuidv4();
    const payload = {
      email,
      type,
      uuid,
      // iat يتم إضافته تلقائياً بواسطة JWT
    };

    const jwtToken = this.jwtService.sign(payload, {
      expiresIn: `${this.QUICKSIGN_EXPIRY_MINUTES}m`,
    });

    // حساب وقت الانتهاء
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.QUICKSIGN_EXPIRY_MINUTES);

    // ⚡ حفظ في Redis للتحقق السريع
    const tokenCacheKey = `${this.CACHE_PREFIX}${this.hashToken(jwtToken)}`;
    const tokenData = {
      email,
      type,
      userId: existingUser?.id,
      expiresAt: expiresAt.toISOString(),
      used: false,
    };
    await this.redis.set(tokenCacheKey, JSON.stringify(tokenData), this.QUICKSIGN_EXPIRY_MINUTES * 60);

    // 🔒 حفظ في قاعدة البيانات بشكل غير متزامن (للسجلات)
    this.prisma.quicksign_links.create({
      data: {
        id: uuidv4(),
        email,
        token: jwtToken,
        type,
        expiresAt,
        ipAddress,
        userAgent,
        userId: existingUser?.id,
      },
    }).catch(err => console.error('[QuickSign] Failed to save to DB:', err));

    return {
      token: jwtToken,
      type,
      expiresIn: this.QUICKSIGN_EXPIRY_MINUTES * 60, // بالثواني
    };
  }

  /**
   * 🔒 التحقق من صلاحية QuickSign token
   * ⚡ محسّن للأداء - يتحقق من Redis أولاً
   */
  async verifyQuickSign(token: string): Promise<{
    valid: boolean;
    email?: string;
    type?: QuickSignType;
    userId?: string;
    used?: boolean;
    expired?: boolean;
    profileCompleted?: boolean;
  }> {
    try {
      // 🔒 فك تشفير JWT أولاً للتحقق من الصلاحية
      const payload = this.jwtService.verify(token);

      // ⚡ التحقق من Redis أولاً (أسرع)
      const tokenCacheKey = `${this.CACHE_PREFIX}${this.hashToken(token)}`;
      const cachedDataStr = await this.redis.get(tokenCacheKey);
      
      if (cachedDataStr) {
        const cachedData: {
          email: string;
          type: QuickSignType;
          userId?: string;
          expiresAt: string;
          used: boolean;
        } = JSON.parse(cachedDataStr);

        // التحقق من الاستخدام المسبق
        if (cachedData.used) {
          return {
            valid: false,
            used: true,
            email: cachedData.email,
          };
        }

        // التحقق من انتهاء الصلاحية
        if (new Date() > new Date(cachedData.expiresAt)) {
          return {
            valid: false,
            expired: true,
            email: cachedData.email,
          };
        }

        // جلب profileCompleted من الـ cache إذا كان هناك userId
        let profileCompleted = false;
        if (cachedData.userId) {
          const userCacheKey = `${this.USER_CACHE_PREFIX}${cachedData.email}`;
          const cachedUserStr = await this.redis.get(userCacheKey);
          if (cachedUserStr) {
            const cachedUser = JSON.parse(cachedUserStr);
            profileCompleted = cachedUser?.profileCompleted || false;
          }
        }

        return {
          valid: true,
          email: cachedData.email,
          type: cachedData.type,
          userId: cachedData.userId,
          profileCompleted,
        };
      }

      // ⚡ Fallback إلى قاعدة البيانات
      const quickSign = await this.prisma.quicksign_links.findUnique({
        where: { token },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              profileCompleted: true,
            },
          },
        },
      });

      if (!quickSign) {
        return { valid: false };
      }

      // التحقق من الاستخدام المسبق
      if (quickSign.used) {
        return {
          valid: false,
          used: true,
          email: quickSign.email,
        };
      }

      // التحقق من انتهاء الصلاحية
      if (new Date() > quickSign.expiresAt) {
        return {
          valid: false,
          expired: true,
          email: quickSign.email,
        };
      }

      // استخدام userId من quickSign مباشرة أو من users relation
      const userId = quickSign.userId || (quickSign as any).users?.id;
      const profileCompleted = (quickSign as any).users?.profileCompleted || false;

      return {
        valid: true,
        email: quickSign.email,
        type: quickSign.type,
        userId,
        profileCompleted,
      };
    } catch (error) {
      // JWT verification failed
      return { valid: false, expired: true };
    }
  }

  /**
   * التحقق من صلاحية SIGNUP token لإكمال الملف الشخصي
   * هذا يسمح باستخدام token حتى لو كان marked as used
   * طالما لم يتم إنشاء مستخدم بعد
   */
  async verifySignupToken(token: string): Promise<{
    valid: boolean;
    email?: string;
    type?: QuickSignType;
    expired?: boolean;
    alreadyRegistered?: boolean;
  }> {
    try {
      // فك تشفير JWT
      const payload = this.jwtService.verify(token);

      // البحث عن Token في قاعدة البيانات
      const quickSign = await this.prisma.quicksign_links.findUnique({
        where: { token },
      });

      if (!quickSign) {
        return { valid: false };
      }

      // Reject tokens that were already consumed
      if (quickSign.used) {
        return { valid: false, used: true, email: quickSign.email } as any;
      }

      // التحقق من انتهاء الصلاحية
      if (new Date() > quickSign.expiresAt) {
        return {
          valid: false,
          expired: true,
          email: quickSign.email,
        };
      }

      // التحقق من أن هذا token من نوع SIGNUP
      if (quickSign.type !== QuickSignType.SIGNUP) {
        return { valid: false };
      }

      // التحقق إذا كان المستخدم قد سجل بالفعل بهذا البريد
      const existingUser = await this.prisma.user.findUnique({
        where: { email: quickSign.email },
      });

      if (existingUser) {
        return {
          valid: false,
          alreadyRegistered: true,
          email: quickSign.email,
        };
      }

      return {
        valid: true,
        email: quickSign.email,
        type: quickSign.type,
      };
    } catch (error) {
      // JWT verification failed
      return { valid: false, expired: true };
    }
  }

  /**
   * تحديد QuickSign كمستخدم
   * ⚡ يحدّث Redis + DB
   */
  async markQuickSignAsUsed(token: string): Promise<void> {
    // ⚡ تحديث Redis أولاً (سريع)
    const tokenCacheKey = `${this.CACHE_PREFIX}${this.hashToken(token)}`;
    const cachedDataStr = await this.redis.get(tokenCacheKey);
    if (cachedDataStr) {
      const cachedData = JSON.parse(cachedDataStr);
      cachedData.used = true;
      await this.redis.set(tokenCacheKey, JSON.stringify(cachedData), 60); // نحتفظ لمدة دقيقة فقط
    }

    // تحديث DB
    await this.prisma.quicksign_links.update({
      where: { token },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });
  }

  /**
   * إبطال QuickSign link
   */
  async invalidateQuickSign(token: string): Promise<void> {
    // ⚡ حذف من Redis
    const tokenCacheKey = `${this.CACHE_PREFIX}${this.hashToken(token)}`;
    await this.redis.del(tokenCacheKey);

    await this.prisma.quicksign_links.updateMany({
      where: { token },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });
  }

  /**
   * إبطال جميع QuickSign links لبريد معين
   */
  async invalidateAllForEmail(email: string): Promise<void> {
    await this.prisma.quicksign_links.updateMany({
      where: {
        email,
        used: false,
      },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });
  }

  /**
   * تنظيف QuickSign links المنتهية (Cron job)
   */
  async cleanupExpiredLinks(): Promise<number> {
    const result = await this.prisma.quicksign_links.deleteMany({
      where: {
        OR: [
          {
            expiresAt: {
              lt: new Date(),
            },
          },
          {
            used: true,
            usedAt: {
              lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // حذف المستخدمة بعد 7 أيام
            },
          },
        ],
      },
    });

    return result.count;
  }

  /**
   * التحقق من وجود QuickSign نشط للبريد
   */
  async hasActiveQuickSign(email: string): Promise<boolean> {
    const activeLink = await this.prisma.quicksign_links.findFirst({
      where: {
        email,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return !!activeLink;
  }

  /**
   * الحصول على آخر QuickSign لبريد معين
   */
  async getLatestQuickSign(email: string) {
    return this.prisma.quicksign_links.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });
  }
}
