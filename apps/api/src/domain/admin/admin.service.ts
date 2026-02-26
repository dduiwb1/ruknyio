import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma/prisma.service';
import { RedisService } from '../../core/cache/redis.service';
import { S3Service } from '../../shared/services/s3.service';

@Injectable()
export class AdminService {
  private readonly CACHE_PREFIX = 'admin:';
  private readonly CACHE_TTL = 120; // 2 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * Platform-wide statistics
   */
  async getPlatformStats() {
    const cacheKey = `${this.CACHE_PREFIX}platform-stats`;
    const cached = await this.redis.get<any>(cacheKey);
    if (cached) return cached;

    const [
      totalUsers,
      totalStores,
      totalForms,
      totalEvents,
      totalOrders,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      activeStores,
      activeForms,
      activeEvents,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.store.count(),
      this.prisma.form.count(),
      this.prisma.event.count(),
      this.prisma.orders.count(),
      this.prisma.user.count({
        where: {
          createdAt: { gte: this.startOfDay() },
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: this.startOfWeek() },
        },
      }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: this.startOfMonth() },
        },
      }),
      this.prisma.store.count({ where: { status: 'ACTIVE' } }),
      this.prisma.form.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.event.count({ where: { status: { in: ['SCHEDULED', 'ONGOING'] } } }),
    ]);

    const stats = {
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
      },
      stores: {
        total: totalStores,
        active: activeStores,
      },
      forms: {
        total: totalForms,
        active: activeForms,
      },
      events: {
        total: totalEvents,
        active: activeEvents,
      },
      orders: {
        total: totalOrders,
      },
    };

    await this.redis.set(cacheKey, JSON.stringify(stats), this.CACHE_TTL);
    return stats;
  }

  /**
   * Recent platform activity (signups, stores, forms, events)
   */
  async getRecentActivity(limit = 15) {
    const cacheKey = `${this.CACHE_PREFIX}recent-activity:${limit}`;
    const cached = await this.redis.get<any>(cacheKey);
    if (cached) return cached;

    const [recentUsers, recentStores, recentForms, recentEvents] = await Promise.all([
      this.prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          profile: { select: { name: true, avatar: true } },
        },
      }),
      this.prisma.store.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          user: { select: { email: true, profile: { select: { name: true } } } },
        },
      }),
      this.prisma.form.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          createdAt: true,
          user: { select: { email: true, profile: { select: { name: true } } } },
        },
      }),
      this.prisma.event.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          user: { select: { email: true, profile: { select: { name: true } } } },
        },
      }),
    ]);

    // Merge and sort by createdAt
    const activities = [
      ...recentUsers.map((u) => ({
        id: u.id,
        type: 'user_signup' as const,
        title: u.profile?.name || u.email,
        subtitle: u.email,
        avatar: u.profile?.avatar,
        role: u.role,
        createdAt: u.createdAt,
      })),
      ...recentStores.map((s) => ({
        id: s.id,
        type: 'store_created' as const,
        title: s.name,
        subtitle: s.user?.profile?.name || s.user?.email || '',
        status: s.status,
        createdAt: s.createdAt,
      })),
      ...recentForms.map((f) => ({
        id: f.id,
        type: 'form_created' as const,
        title: f.title,
        subtitle: f.user?.profile?.name || f.user?.email || '',
        formType: f.type,
        status: f.status,
        createdAt: f.createdAt,
      })),
      ...recentEvents.map((e) => ({
        id: e.id,
        type: 'event_created' as const,
        title: e.title,
        subtitle: (e as any).user?.profile?.name || (e as any).user?.email || '',
        status: e.status,
        createdAt: e.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    await this.redis.set(cacheKey, JSON.stringify(activities), 60);
    return activities;
  }

  /**
   * System / platform health overview
   */
  async getSystemHealth() {
    const startTime = Date.now();

    // DB check
    let dbStatus = 'healthy';
    let dbResponseTime = 0;
    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbResponseTime = Date.now() - dbStart;
    } catch {
      dbStatus = 'unhealthy';
    }

    // Redis check
    let redisStatus = 'healthy';
    let redisResponseTime = 0;
    try {
      const redisStart = Date.now();
      await this.redis.set('health:ping', 'pong', 10);
      redisResponseTime = Date.now() - redisStart;
    } catch {
      redisStatus = 'unhealthy';
    }

    return {
      status: dbStatus === 'healthy' && redisStatus === 'healthy' ? 'healthy' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
        },
        redis: {
          status: redisStatus,
          responseTime: redisResponseTime,
        },
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      latency: Date.now() - startTime,
    };
  }

  // ─── Users Management ──────────────────────────────

  /**
   * User statistics for admin dashboard
   */
  async getUserStats() {
    const cacheKey = `${this.CACHE_PREFIX}user-stats`;
    const cached = await this.redis.get<any>(cacheKey);
    if (cached) return cached;

    const [
      totalUsers,
      todayUsers,
      weekUsers,
      monthUsers,
      roleCounts,
      verifiedCount,
      profileCompletedCount,
      twoFACount,
      activeToday,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { createdAt: { gte: this.startOfDay() } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: this.startOfWeek() } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: this.startOfMonth() } },
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
      this.prisma.user.count({
        where: { emailVerified: true },
      }),
      this.prisma.user.count({
        where: { profileCompleted: true },
      }),
      this.prisma.user.count({
        where: { twoFactorEnabled: true },
      }),
      this.prisma.user.count({
        where: { lastLoginAt: { gte: this.startOfDay() } },
      }),
    ]);

    const getCount = (role: string) =>
      roleCounts.find((r) => r.role === role)?._count?.id || 0;

    const stats = {
      total: totalUsers,
      today: todayUsers,
      thisWeek: weekUsers,
      thisMonth: monthUsers,
      byRole: {
        admin: getCount('ADMIN'),
        premium: getCount('PREMIUM'),
        basic: getCount('BASIC'),
        guest: getCount('GUEST'),
      },
      verified: verifiedCount,
      profileCompleted: profileCompletedCount,
      twoFactorEnabled: twoFACount,
      activeToday,
      verificationRate:
        totalUsers > 0 ? Math.round((verifiedCount / totalUsers) * 100) : 0,
    };

    await this.redis.set(cacheKey, JSON.stringify(stats), this.CACHE_TTL);
    return stats;
  }

  /**
   * Get paginated users list with filters (admin)
   */
  async getUsers(params: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    emailVerified?: boolean;
    profileCompleted?: boolean;
    has2FA?: boolean;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page,
      limit,
      search,
      role,
      emailVerified,
      profileCompleted,
      has2FA,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { name: { contains: search, mode: 'insensitive' } } },
        { profile: { username: { contains: search, mode: 'insensitive' } } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (emailVerified !== undefined) where.emailVerified = emailVerified;
    if (profileCompleted !== undefined) where.profileCompleted = profileCompleted;
    if (has2FA !== undefined) where.twoFactorEnabled = has2FA;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Build sort
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      const direction = sortOrder || 'desc';
      if (sortBy === 'email') orderBy = { email: direction };
      else if (sortBy === 'lastLogin') orderBy = { lastLoginAt: direction };
      else if (sortBy === 'role') orderBy = { role: direction };
      else orderBy = { createdAt: direction };
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          email: true,
          role: true,
          emailVerified: true,
          profileCompleted: true,
          twoFactorEnabled: true,
          phoneNumber: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          accountType: true,
          googleId: true,
          profile: {
            select: {
              name: true,
              username: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              events: true,
              forms: true,
              orders: true,
              sessions: true,
              posts: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: data.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        emailVerified: u.emailVerified,
        profileCompleted: u.profileCompleted,
        twoFactorEnabled: u.twoFactorEnabled,
        phoneNumber: u.phoneNumber,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        accountType: u.accountType,
        hasGoogle: !!u.googleId,
        name: u.profile?.name || null,
        username: u.profile?.username || null,
        avatar: u.profile?.avatar || null,
        eventsCount: u._count?.events || 0,
        formsCount: u._count?.forms || 0,
        ordersCount: u._count?.orders || 0,
        sessionsCount: u._count?.sessions || 0,
        postsCount: u._count?.posts || 0,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single user details (admin)
   */
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            coverImage: true,
            bio: true,
            visibility: true,
            storageUsed: true,
            storageLimit: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            status: true,
          },
        },
        sessions: {
          where: { isRevoked: false },
          orderBy: { lastActivity: 'desc' },
          take: 10,
          select: {
            id: true,
            deviceName: true,
            deviceType: true,
            browser: true,
            os: true,
            ipAddress: true,
            location: true,
            lastActivity: true,
            createdAt: true,
          },
        },
        securityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            action: true,
            status: true,
            description: true,
            ipAddress: true,
            browser: true,
            os: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            events: true,
            forms: true,
            orders: true,
            posts: true,
            sessions: true,
            followers: true,
            following: true,
            reviews: true,
            comments: true,
            files: true,
          },
        },
      },
    });

    if (!user) throw new Error('User not found');

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      profileCompleted: user.profileCompleted,
      twoFactorEnabled: user.twoFactorEnabled,
      phoneNumber: user.phoneNumber,
      phoneVerified: user.phoneVerified,
      accountType: user.accountType,
      hasGoogle: !!user.googleId,
      hasLinkedin: !!user.linkedinId,
      hasTelegram: !!user.telegramChatId,
      telegramUsername: user.telegramUsername,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile
        ? {
            id: user.profile.id,
            name: user.profile.name,
            username: user.profile.username,
            avatar: user.profile.avatar,
            coverImage: user.profile.coverImage,
            bio: user.profile.bio,
            visibility: user.profile.visibility,
            storageUsed: Number(user.profile.storageUsed),
            storageLimit: Number(user.profile.storageLimit),
          }
        : null,
      store: user.store
        ? {
            id: user.store.id,
            name: user.store.name,
            slug: user.store.slug,
            logo: user.store.logo,
            status: user.store.status,
          }
        : null,
      sessions: user.sessions,
      securityLogs: user.securityLogs,
      counts: {
        events: user._count?.events || 0,
        forms: user._count?.forms || 0,
        orders: user._count?.orders || 0,
        posts: user._count?.posts || 0,
        sessions: user._count?.sessions || 0,
        followers: user._count?.followers || 0,
        following: user._count?.following || 0,
        reviews: user._count?.reviews || 0,
        comments: user._count?.comments || 0,
        files: user._count?.files || 0,
      },
    };
  }

  /**
   * Admin update user role
   */
  async adminUpdateUserRole(id: string, role: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');

    await this.prisma.user.update({
      where: { id },
      data: { role: role as any },
    });

    // Invalidate cache
    await this.redis.del(`${this.CACHE_PREFIX}user-stats`);
    await this.redis.del(`${this.CACHE_PREFIX}platform-stats`);

    return this.getUserById(id);
  }

  /**
   * Admin revoke all sessions for a user
   */
  async adminRevokeUserSessions(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');

    await this.prisma.session.updateMany({
      where: { userId: id, isRevoked: false },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: 'Revoked by admin',
      },
    });

    return { success: true, message: 'All sessions revoked' };
  }

  /**
   * Export users (no pagination) for CSV
   */
  async exportUsers(params: {
    role?: string;
    emailVerified?: boolean;
    startDate?: string;
    endDate?: string;
  }) {
    const { role, emailVerified, startDate, endDate } = params;
    const where: any = {};

    if (role) where.role = role;
    if (emailVerified !== undefined) where.emailVerified = emailVerified;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        profileCompleted: true,
        twoFactorEnabled: true,
        phoneNumber: true,
        accountType: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: { name: true, username: true },
        },
        _count: {
          select: { orders: true, events: true, forms: true, posts: true },
        },
      },
    });

    return {
      data: users.map((u) => ({
        name: u.profile?.name || '—',
        username: u.profile?.username || '—',
        email: u.email,
        role: u.role,
        emailVerified: u.emailVerified ? 'Yes' : 'No',
        profileCompleted: u.profileCompleted ? 'Yes' : 'No',
        twoFactorEnabled: u.twoFactorEnabled ? 'Yes' : 'No',
        phone: u.phoneNumber || '—',
        accountType: u.accountType,
        ordersCount: u._count?.orders || 0,
        eventsCount: u._count?.events || 0,
        formsCount: u._count?.forms || 0,
        postsCount: u._count?.posts || 0,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
      total: users.length,
    };
  }

  /**
   * Admin delete user
   */
  async adminDeleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');
    if (user.role === 'ADMIN') throw new Error('Cannot delete admin users');

    // Revoke all sessions first
    await this.prisma.session.updateMany({
      where: { userId: id },
      data: { isRevoked: true, revokedAt: new Date(), revokedReason: 'User deleted by admin' },
    });

    // Delete the user (cascading deletes handle related records)
    await this.prisma.user.delete({ where: { id } });

    // Invalidate cache
    await this.redis.del(`${this.CACHE_PREFIX}user-stats`);
    await this.redis.del(`${this.CACHE_PREFIX}platform-stats`);

    return { success: true };
  }

  // ─── Verification Requests Management ──────────────

  /**
   * Get verification request statistics
   */
  async getVerificationStats() {
    const cacheKey = `${this.CACHE_PREFIX}verification-stats`;
    const cached = await this.redis.get<any>(cacheKey);
    if (cached) return cached;

    const [total, pending, underReview, approved, rejected, today, thisWeek, thisMonth] =
      await Promise.all([
        this.prisma.verificationRequest.count(),
        this.prisma.verificationRequest.count({ where: { status: 'PENDING' } }),
        this.prisma.verificationRequest.count({ where: { status: 'UNDER_REVIEW' } }),
        this.prisma.verificationRequest.count({ where: { status: 'APPROVED' } }),
        this.prisma.verificationRequest.count({ where: { status: 'REJECTED' } }),
        this.prisma.verificationRequest.count({ where: { createdAt: { gte: this.startOfDay() } } }),
        this.prisma.verificationRequest.count({ where: { createdAt: { gte: this.startOfWeek() } } }),
        this.prisma.verificationRequest.count({ where: { createdAt: { gte: this.startOfMonth() } } }),
      ]);

    const stats = {
      total,
      today,
      thisWeek,
      thisMonth,
      byStatus: { pending, underReview, approved, rejected },
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    };

    await this.redis.set(cacheKey, JSON.stringify(stats), this.CACHE_TTL);
    return stats;
  }

  /**
   * Get paginated verification requests
   */
  async getVerificationRequests(params: {
    page: number;
    limit: number;
    status?: string;
    type?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page, limit, status, type, search, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.verificationRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isVerified: true,
              profile: {
                select: { name: true, username: true, avatar: true },
              },
            },
          },
        },
      }),
      this.prisma.verificationRequest.count({ where }),
    ]);

    return {
      data: data.map((r) => ({
        id: r.id,
        type: r.type,
        status: r.status,
        fullName: r.fullName,
        businessName: r.businessName,
        screenshotsCount: r.screenshots.length,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: {
          id: r.user.id,
          email: r.user.email,
          role: r.user.role,
          isVerified: r.user.isVerified,
          name: r.user.profile?.name || null,
          username: r.user.profile?.username || null,
          avatar: r.user.profile?.avatar || null,
        },
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single verification request detail
   */
  async getVerificationRequestById(id: string) {
    const request = await this.prisma.verificationRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isVerified: true,
            emailVerified: true,
            profileCompleted: true,
            twoFactorEnabled: true,
            lastLoginAt: true,
            createdAt: true,
            profile: {
              select: {
                name: true,
                username: true,
                avatar: true,
                bio: true,
              },
            },
            store: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!request) throw new Error('Verification request not found');

    // Generate presigned URLs for S3 screenshot keys
    let screenshotUrls: string[] = request.screenshots || [];
    if (request.screenshots?.length) {
      // Only generate presigned URLs for S3 keys (not legacy base64 data URLs)
      const isS3Keys = !request.screenshots[0]?.startsWith('data:');
      if (isS3Keys) {
        const bucket = this.s3Service.getDefaultBucket();
        screenshotUrls = await this.s3Service.getPresignedGetUrls(
          bucket,
          request.screenshots,
          7200, // 2 hours for admin review
        );
      }
    }

    return {
      id: request.id,
      type: request.type,
      status: request.status,
      fullName: request.fullName,
      socialLinks: request.socialLinks,
      screenshots: screenshotUrls,
      businessName: request.businessName,
      businessEmail: request.businessEmail,
      notes: request.notes,
      adminNotes: request.adminNotes,
      rejectionReason: request.rejectionReason,
      reviewedBy: request.reviewedBy,
      reviewedAt: request.reviewedAt,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      user: {
        id: request.user.id,
        email: request.user.email,
        role: request.user.role,
        isVerified: request.user.isVerified,
        emailVerified: request.user.emailVerified,
        profileCompleted: request.user.profileCompleted,
        twoFactorEnabled: request.user.twoFactorEnabled,
        lastLoginAt: request.user.lastLoginAt,
        createdAt: request.user.createdAt,
        name: request.user.profile?.name || null,
        username: request.user.profile?.username || null,
        avatar: request.user.profile?.avatar || null,
        bio: request.user.profile?.bio || null,
        store: request.user.store,
      },
    };
  }

  /**
   * Review (approve/reject) a verification request
   */
  async reviewVerificationRequest(
    id: string,
    body: { action: 'approve' | 'reject'; adminNotes?: string; rejectionReason?: string },
  ) {
    const request = await this.prisma.verificationRequest.findUnique({
      where: { id },
    });
    if (!request) throw new Error('Verification request not found');

    if (body.action === 'approve') {
      await this.prisma.$transaction([
        this.prisma.verificationRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            adminNotes: body.adminNotes || null,
            reviewedAt: new Date(),
          },
        }),
        this.prisma.user.update({
          where: { id: request.userId },
          data: {
            isVerified: true,
            verifiedAt: new Date(),
          },
        }),
      ]);
    } else {
      await this.prisma.verificationRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason: body.rejectionReason || null,
          adminNotes: body.adminNotes || null,
          reviewedAt: new Date(),
        },
      });
    }

    // Invalidate caches
    await this.redis.del(`${this.CACHE_PREFIX}verification-stats`);
    await this.redis.del(`${this.CACHE_PREFIX}user-stats`);

    return this.getVerificationRequestById(id);
  }

  /**
   * Export verification requests (no pagination)
   */
  async exportVerificationRequests(params: {
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { status, type, startDate, endDate } = params;
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const requests = await this.prisma.verificationRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            profile: { select: { name: true, username: true } },
          },
        },
      },
    });

    return {
      data: requests.map((r) => ({
        fullName: r.fullName,
        email: r.user.email,
        username: r.user.profile?.username || '—',
        type: r.type,
        status: r.status,
        businessName: r.businessName || '—',
        screenshotsCount: r.screenshots.length,
        notes: r.notes || '—',
        rejectionReason: r.rejectionReason || '—',
        createdAt: r.createdAt,
        reviewedAt: r.reviewedAt,
      })),
      total: requests.length,
    };
  }

  // ---- Helpers ----

  private startOfDay(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private startOfWeek(): Date {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private startOfMonth(): Date {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // ─── Stores Management ─────────────────────────────

  /**
   * Get paginated stores list with filters
   */
  async getStores(params: {
    page: number;
    limit: number;
    search?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    categoryId?: string;
    city?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page, limit, search, status, categoryId, city, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { profile: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const orderBy: any = {};
    if (sortBy === 'name') orderBy.name = sortOrder || 'asc';
    else if (sortBy === 'products') orderBy.products = { _count: sortOrder || 'desc' };
    else if (sortBy === 'orders') orderBy.orders = { _count: sortOrder || 'desc' };
    else orderBy.createdAt = sortOrder || 'desc';

    const [stores, total] = await Promise.all([
      this.prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logo: true,
          banner: true,
          contactEmail: true,
          contactPhone: true,
          status: true,
          city: true,
          country: true,
          categoryId: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  name: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
          store_categories: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              icon: true,
              color: true,
            },
          },
          _count: {
            select: {
              products: true,
              orders: true,
              coupons: true,
            },
          },
        },
      }),
      this.prisma.store.count({ where }),
    ]);

    return {
      data: stores,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Store-specific statistics
   */
  async getStoreStats() {
    const cacheKey = `${this.CACHE_PREFIX}store-stats`;
    const cached = await this.redis.get<any>(cacheKey);
    if (cached) return cached;

    const [
      totalStores,
      activeStores,
      inactiveStores,
      newThisMonth,
      newThisWeek,
      totalProducts,
      totalOrders,
      storesByCategory,
      storesByCity,
    ] = await Promise.all([
      this.prisma.store.count(),
      this.prisma.store.count({ where: { status: 'ACTIVE' } }),
      this.prisma.store.count({ where: { status: 'INACTIVE' } }),
      this.prisma.store.count({ where: { createdAt: { gte: this.startOfMonth() } } }),
      this.prisma.store.count({ where: { createdAt: { gte: this.startOfWeek() } } }),
      this.prisma.products.count(),
      this.prisma.orders.count(),
      this.prisma.store_categories.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          nameAr: true,
          color: true,
          _count: { select: { stores: true } },
        },
        orderBy: { order: 'asc' },
      }),
      this.prisma.store.groupBy({
        by: ['city'],
        _count: { id: true },
        where: { city: { not: null } },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    const stats = {
      total: totalStores,
      active: activeStores,
      inactive: inactiveStores,
      newThisMonth,
      newThisWeek,
      totalProducts,
      totalOrders,
      byCategory: storesByCategory.map((c) => ({
        id: c.id,
        name: c.name,
        nameAr: c.nameAr,
        color: c.color,
        count: c._count.stores,
      })),
      byCity: storesByCity.map((c) => ({
        city: c.city || 'Unknown',
        count: c._count.id,
      })),
    };

    await this.redis.set(cacheKey, JSON.stringify(stats), this.CACHE_TTL);
    return stats;
  }

  /**
   * Get single store details
   */
  async getStoreById(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            profile: {
              select: {
                name: true,
                username: true,
                avatar: true,
                bio: true,
              },
            },
          },
        },
        store_categories: true,
        _count: {
          select: {
            products: true,
            orders: true,
            coupons: true,
            forms: true,
          },
        },
      },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    // Get recent products
    const recentProducts = await this.prisma.products.findMany({
      where: { storeId: id },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        nameAr: true,
        slug: true,
        price: true,
        salePrice: true,
        quantity: true,
        status: true,
        currency: true,
        isFeatured: true,
        createdAt: true,
        product_images: {
          take: 1,
          where: { isPrimary: true },
          select: { imagePath: true },
        },
      },
    });

    // Get recent orders
    const recentOrders = await this.prisma.orders.findMany({
      where: { storeId: id },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        currency: true,
        createdAt: true,
        phoneNumber: true,
      },
    });

    // Get order stats
    const orderStats = await this.prisma.orders.groupBy({
      by: ['status'],
      where: { storeId: id },
      _count: { id: true },
    });

    return {
      ...store,
      recentProducts,
      recentOrders,
      orderStats: orderStats.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
    };
  }

  /**
   * Update store status
   */
  async updateStoreStatus(id: string, status: 'ACTIVE' | 'INACTIVE') {
    const store = await this.prisma.store.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, status: true },
    });
    // Invalidate cache
    await this.redis.del(`${this.CACHE_PREFIX}store-stats`);
    await this.redis.del(`${this.CACHE_PREFIX}platform-stats`);
    return store;
  }

  /**
   * Delete a store
   */
  async deleteStore(id: string) {
    await this.prisma.store.delete({ where: { id } });
    // Invalidate cache
    await this.redis.del(`${this.CACHE_PREFIX}store-stats`);
    await this.redis.del(`${this.CACHE_PREFIX}platform-stats`);
    return { success: true };
  }

  // ─── Store Categories ──────────────────────────────

  /**
   * Get all store categories
   */
  async getStoreCategories() {
    return this.prisma.store_categories.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { stores: true } },
      },
    });
  }

  /**
   * Create a store category
   */
  async createStoreCategory(data: {
    name: string;
    nameAr: string;
    slug: string;
    description?: string;
    descriptionAr?: string;
    icon?: string;
    color?: string;
    order?: number;
    templateFields?: Record<string, any>;
  }) {
    const id = require('crypto').randomUUID();
    return this.prisma.store_categories.create({
      data: {
        id,
        ...data,
        color: data.color || '#6366f1',
        order: data.order || 0,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Update a store category
   */
  async updateStoreCategory(
    id: string,
    data: {
      name?: string;
      nameAr?: string;
      slug?: string;
      description?: string;
      descriptionAr?: string;
      icon?: string;
      color?: string;
      order?: number;
      isActive?: boolean;
      templateFields?: Record<string, any>;
    },
  ) {
    return this.prisma.store_categories.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  /**
   * Delete a store category
   */
  async deleteStoreCategory(id: string) {
    // Check if stores are using this category
    const storesUsingCategory = await this.prisma.store.count({
      where: { categoryId: id },
    });

    if (storesUsingCategory > 0) {
      throw new Error(
        `Cannot delete category: ${storesUsingCategory} stores are using it`,
      );
    }

    await this.prisma.store_categories.delete({ where: { id } });
    return { success: true };
  }

  // ─── Orders Management ─────────────────────────────

  /**
   * Platform-wide order statistics
   */
  async getOrderStats() {
    const cacheKey = `${this.CACHE_PREFIX}order-stats`;
    const cached = await this.redis.get<any>(cacheKey);
    if (cached) return cached;

    const [
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      statusCounts,
      revenueTotal,
      revenueThisMonth,
      revenueToday,
      avgOrderValue,
    ] = await Promise.all([
      this.prisma.orders.count(),
      this.prisma.orders.count({
        where: { createdAt: { gte: this.startOfDay() } },
      }),
      this.prisma.orders.count({
        where: { createdAt: { gte: this.startOfWeek() } },
      }),
      this.prisma.orders.count({
        where: { createdAt: { gte: this.startOfMonth() } },
      }),
      this.prisma.orders.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.orders.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { total: true },
      }),
      this.prisma.orders.aggregate({
        where: {
          status: 'DELIVERED',
          createdAt: { gte: this.startOfMonth() },
        },
        _sum: { total: true },
      }),
      this.prisma.orders.aggregate({
        where: {
          status: 'DELIVERED',
          createdAt: { gte: this.startOfDay() },
        },
        _sum: { total: true },
      }),
      this.prisma.orders.aggregate({
        _avg: { total: true },
      }),
    ]);

    const getCount = (status: string) =>
      statusCounts.find((s) => s.status === status)?._count?.id || 0;

    const stats = {
      total: totalOrders,
      today: todayOrders,
      thisWeek: weekOrders,
      thisMonth: monthOrders,
      byStatus: {
        pending: getCount('PENDING'),
        confirmed: getCount('CONFIRMED'),
        processing: getCount('PROCESSING'),
        shipped: getCount('SHIPPED'),
        outForDelivery: getCount('OUT_FOR_DELIVERY'),
        delivered: getCount('DELIVERED'),
        cancelled: getCount('CANCELLED'),
        refunded: getCount('REFUNDED'),
      },
      revenue: {
        total: Number(revenueTotal._sum?.total || 0),
        thisMonth: Number(revenueThisMonth._sum?.total || 0),
        today: Number(revenueToday._sum?.total || 0),
      },
      averageOrderValue: Number(avgOrderValue._avg?.total || 0),
      cancellationRate:
        totalOrders > 0
          ? Math.round((getCount('CANCELLED') / totalOrders) * 100)
          : 0,
    };

    await this.redis.set(cacheKey, JSON.stringify(stats), this.CACHE_TTL);
    return stats;
  }

  /**
   * Get paginated orders list with filters (admin)
   */
  async getOrders(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    storeId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    minAmount?: number;
    maxAmount?: number;
  }) {
    const {
      page,
      limit,
      search,
      status,
      storeId,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      minAmount,
      maxAmount,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) where.status = status;
    if (storeId) where.storeId = storeId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.total = {};
      if (minAmount !== undefined) where.total.gte = minAmount;
      if (maxAmount !== undefined) where.total.lte = maxAmount;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        {
          users: {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              {
                profile: {
                  name: { contains: search, mode: 'insensitive' },
                },
              },
            ],
          },
        },
        {
          stores: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    const orderBy: any = {};
    if (sortBy === 'total') orderBy.total = sortOrder || 'desc';
    else if (sortBy === 'status') orderBy.status = sortOrder || 'asc';
    else if (sortBy === 'orderNumber') orderBy.orderNumber = sortOrder || 'desc';
    else orderBy.createdAt = sortOrder || 'desc';

    const [orders, total] = await Promise.all([
      this.prisma.orders.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          subtotal: true,
          shippingFee: true,
          discount: true,
          total: true,
          currency: true,
          phoneNumber: true,
          customerNote: true,
          storeNote: true,
          estimatedDelivery: true,
          deliveredAt: true,
          cancelledAt: true,
          cancellationReason: true,
          createdAt: true,
          updatedAt: true,
          users: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { name: true, avatar: true },
              },
            },
          },
          stores: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
          _count: {
            select: { order_items: true },
          },
        },
      }),
      this.prisma.orders.count({ where }),
    ]);

    return {
      data: orders.map((order) => ({
        ...order,
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shippingFee),
        discount: Number(order.discount),
        total: Number(order.total),
        itemsCount: order._count?.order_items || 0,
        customer: order.users
          ? {
              id: order.users.id,
              email: order.users.email,
              name: order.users.profile?.name,
              avatar: order.users.profile?.avatar,
            }
          : null,
        store: order.stores,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single order details (admin — no ownership check)
   */
  async getOrderById(id: string) {
    const order = await this.prisma.orders.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            profile: {
              select: { name: true, username: true, avatar: true },
            },
          },
        },
        stores: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
        addresses: true,
        order_items: {
          include: {
            products: {
              include: {
                product_images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
        coupons: {
          select: { code: true, discountType: true, discountValue: true },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      discount: Number(order.discount),
      total: Number(order.total),
      currency: order.currency,
      phoneNumber: order.phoneNumber,
      customerNote: order.customerNote,
      storeNote: order.storeNote,
      estimatedDelivery: order.estimatedDelivery,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      cancellationReason: order.cancellationReason,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customer: order.users
        ? {
            id: order.users.id,
            email: order.users.email,
            name: order.users.profile?.name,
            username: order.users.profile?.username,
            avatar: order.users.profile?.avatar,
          }
        : null,
      store: order.stores,
      address: order.addresses,
      items: order.order_items?.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productNameAr: item.productNameAr,
        price: Number(item.price),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
        image: item.products?.product_images?.[0]?.imagePath || null,
      })),
      coupon: order.coupons || null,
    };
  }

  /**
   * Admin update order status (no ownership check)
   */
  async adminUpdateOrderStatus(
    id: string,
    status: string,
    storeNote?: string,
    estimatedDelivery?: string,
  ) {
    const order = await this.prisma.orders.findUnique({ where: { id } });
    if (!order) throw new Error('Order not found');

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (storeNote !== undefined) updateData.storeNote = storeNote;
    if (estimatedDelivery)
      updateData.estimatedDelivery = new Date(estimatedDelivery);
    if (status === 'DELIVERED') updateData.deliveredAt = new Date();
    if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      // Restore stock
      const items = await this.prisma.order_items.findMany({
        where: { orderId: id },
      });
      for (const item of items) {
        await this.prisma.products.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
      }
    }

    await this.prisma.orders.update({ where: { id }, data: updateData });

    // Invalidate cache
    await this.redis.del(`${this.CACHE_PREFIX}order-stats`);
    await this.redis.del(`${this.CACHE_PREFIX}platform-stats`);

    return this.getOrderById(id);
  }

  /**
   * Export orders (no pagination) for CSV
   */
  async exportOrders(params: {
    status?: string;
    storeId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { status, storeId, startDate, endDate } = params;
    const where: any = {};

    if (status) where.status = status;
    if (storeId) where.storeId = storeId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const orders = await this.prisma.orders.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        subtotal: true,
        shippingFee: true,
        discount: true,
        total: true,
        currency: true,
        phoneNumber: true,
        customerNote: true,
        storeNote: true,
        estimatedDelivery: true,
        deliveredAt: true,
        cancelledAt: true,
        cancellationReason: true,
        createdAt: true,
        updatedAt: true,
        users: {
          select: {
            email: true,
            profile: { select: { name: true } },
          },
        },
        stores: {
          select: { name: true },
        },
        addresses: {
          select: {
            fullName: true,
            phoneNumber: true,
            city: true,
            district: true,
            street: true,
          },
        },
        _count: {
          select: { order_items: true },
        },
      },
    });

    return {
      data: orders.map((order) => ({
        orderNumber: order.orderNumber,
        status: order.status,
        customerName: order.users?.profile?.name || order.users?.email || '—',
        customerEmail: order.users?.email || '—',
        phone: order.phoneNumber || order.addresses?.phoneNumber || '—',
        storeName: order.stores?.name || '—',
        itemsCount: order._count?.order_items || 0,
        subtotal: Number(order.subtotal),
        shippingFee: Number(order.shippingFee),
        discount: Number(order.discount),
        total: Number(order.total),
        currency: order.currency,
        city: order.addresses?.city || '—',
        district: order.addresses?.district || '—',
        street: order.addresses?.street || '—',
        customerNote: order.customerNote || '',
        storeNote: order.storeNote || '',
        cancellationReason: order.cancellationReason || '',
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        deliveredAt: order.deliveredAt || '',
        cancelledAt: order.cancelledAt || '',
      })),
      total: orders.length,
    };
  }

  /**
   * Admin delete order
   */
  async adminDeleteOrder(id: string) {
    const order = await this.prisma.orders.findUnique({ where: { id } });
    if (!order) throw new Error('Order not found');

    // Delete order items first
    await this.prisma.order_items.deleteMany({ where: { orderId: id } });
    await this.prisma.orders.delete({ where: { id } });

    // Invalidate cache
    await this.redis.del(`${this.CACHE_PREFIX}order-stats`);
    await this.redis.del(`${this.CACHE_PREFIX}platform-stats`);

    return { success: true };
  }

  // ─── Products Management ───────────────────────────

  /**
   * Product statistics for admin dashboard
   */
  async getProductStats() {
    const cacheKey = `${this.CACHE_PREFIX}product-stats`;
    const cached = await this.redis.get<any>(cacheKey);
    if (cached) return cached;

    const [
      totalProducts,
      todayProducts,
      weekProducts,
      monthProducts,
      statusCounts,
      featuredCount,
      outOfStockCount,
      avgPrice,
      categoryCounts,
      storeCounts,
    ] = await Promise.all([
      this.prisma.products.count(),
      this.prisma.products.count({
        where: { createdAt: { gte: this.startOfDay() } },
      }),
      this.prisma.products.count({
        where: { createdAt: { gte: this.startOfWeek() } },
      }),
      this.prisma.products.count({
        where: { createdAt: { gte: this.startOfMonth() } },
      }),
      this.prisma.products.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.products.count({
        where: { isFeatured: true },
      }),
      this.prisma.products.count({
        where: { quantity: 0, trackInventory: true },
      }),
      this.prisma.products.aggregate({
        _avg: { price: true },
      }),
      this.prisma.products.groupBy({
        by: ['categoryId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      this.prisma.products.groupBy({
        by: ['storeId'],
        _count: { id: true },
      }),
    ]);

    const getCount = (status: string) =>
      statusCounts.find((s) => s.status === status)?._count?.id || 0;

    const stats = {
      total: totalProducts,
      today: todayProducts,
      thisWeek: weekProducts,
      thisMonth: monthProducts,
      byStatus: {
        active: getCount('ACTIVE'),
        inactive: getCount('INACTIVE'),
        outOfStock: getCount('OUT_OF_STOCK'),
      },
      featured: featuredCount,
      lowStock: outOfStockCount,
      averagePrice: Number(avgPrice._avg?.price || 0),
      totalStores: storeCounts.length,
      totalCategories: categoryCounts.filter((c) => c.categoryId !== null).length,
    };

    await this.redis.set(cacheKey, JSON.stringify(stats), this.CACHE_TTL);
    return stats;
  }

  /**
   * Get paginated products list with filters (admin)
   */
  async getProducts(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    storeId?: string;
    categoryId?: string;
    isFeatured?: boolean;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    minPrice?: number;
    maxPrice?: number;
  }) {
    const {
      page,
      limit,
      search,
      status,
      storeId,
      categoryId,
      isFeatured,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      minPrice,
      maxPrice,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { stores: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) where.status = status;
    if (storeId) where.storeId = storeId;
    if (categoryId) where.categoryId = categoryId;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Build sort
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      const direction = sortOrder || 'desc';
      if (sortBy === 'price') orderBy = { price: direction };
      else if (sortBy === 'quantity') orderBy = { quantity: direction };
      else if (sortBy === 'name') orderBy = { name: direction };
      else orderBy = { createdAt: direction };
    }

    const [data, total] = await Promise.all([
      this.prisma.products.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          nameAr: true,
          slug: true,
          price: true,
          salePrice: true,
          quantity: true,
          status: true,
          currency: true,
          sku: true,
          isFeatured: true,
          hasVariants: true,
          trackInventory: true,
          createdAt: true,
          updatedAt: true,
          stores: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
          product_categories: {
            select: {
              id: true,
              name: true,
              nameAr: true,
            },
          },
          product_images: {
            where: { isPrimary: true },
            take: 1,
            select: {
              imagePath: true,
            },
          },
          _count: {
            select: {
              order_items: true,
              reviews: true,
              variants: true,
            },
          },
        },
      }),
      this.prisma.products.count({ where }),
    ]);

    return {
      data: data.map((p) => ({
        id: p.id,
        name: p.name,
        nameAr: p.nameAr,
        slug: p.slug,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
        quantity: p.quantity,
        status: p.status,
        currency: p.currency,
        sku: p.sku,
        isFeatured: p.isFeatured,
        hasVariants: p.hasVariants,
        trackInventory: p.trackInventory,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        image: p.product_images[0]?.imagePath || null,
        store: p.stores
          ? { id: p.stores.id, name: p.stores.name, slug: p.stores.slug, logo: p.stores.logo }
          : null,
        category: p.product_categories
          ? { id: p.product_categories.id, name: p.product_categories.name, nameAr: p.product_categories.nameAr }
          : null,
        ordersCount: p._count?.order_items || 0,
        reviewsCount: p._count?.reviews || 0,
        variantsCount: p._count?.variants || 0,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single product details (admin)
   */
  async getProductById(id: string) {
    const product = await this.prisma.products.findUnique({
      where: { id },
      include: {
        stores: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
        product_categories: {
          select: {
            id: true,
            name: true,
            nameAr: true,
          },
        },
        product_images: {
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            imagePath: true,
            displayOrder: true,
            isPrimary: true,
          },
        },
        variants: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            sku: true,
            price: true,
            compareAtPrice: true,
            stock: true,
            attributes: true,
            imageUrl: true,
            isActive: true,
            createdAt: true,
          },
        },
        productAttributes: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            key: true,
            value: true,
            valueAr: true,
          },
        },
        _count: {
          select: {
            order_items: true,
            reviews: true,
            wishlists: true,
          },
        },
      },
    });

    if (!product) throw new Error('Product not found');

    return {
      id: product.id,
      name: product.name,
      nameAr: product.nameAr,
      slug: product.slug,
      description: product.description,
      descriptionAr: product.descriptionAr,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      quantity: product.quantity,
      status: product.status,
      currency: product.currency,
      sku: product.sku,
      isFeatured: product.isFeatured,
      hasVariants: product.hasVariants,
      trackInventory: product.trackInventory,
      attributes: product.attributes,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      store: product.stores
        ? {
            id: product.stores.id,
            name: product.stores.name,
            slug: product.stores.slug,
            logo: product.stores.logo,
            contactEmail: product.stores.contactEmail,
            contactPhone: product.stores.contactPhone,
          }
        : null,
      category: product.product_categories
        ? {
            id: product.product_categories.id,
            name: product.product_categories.name,
            nameAr: product.product_categories.nameAr,
          }
        : null,
      images: product.product_images.map((img) => ({
        id: img.id,
        imagePath: img.imagePath,
        displayOrder: img.displayOrder,
        isPrimary: img.isPrimary,
      })),
      variants: product.variants.map((v) => ({
        id: v.id,
        sku: v.sku,
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
        stock: v.stock,
        attributes: v.attributes,
        imageUrl: v.imageUrl,
        isActive: v.isActive,
        createdAt: v.createdAt,
      })),
      productAttributes: product.productAttributes.map((a) => ({
        id: a.id,
        key: a.key,
        value: a.value,
        valueAr: a.valueAr,
      })),
      ordersCount: product._count?.order_items || 0,
      reviewsCount: product._count?.reviews || 0,
      wishlistsCount: product._count?.wishlists || 0,
    };
  }

  /**
   * Admin update product status
   */
  async adminUpdateProductStatus(id: string, status: string) {
    const product = await this.prisma.products.findUnique({ where: { id } });
    if (!product) throw new Error('Product not found');

    await this.prisma.products.update({
      where: { id },
      data: { status: status as any },
    });

    // Invalidate cache
    await this.redis.del(`${this.CACHE_PREFIX}product-stats`);
    await this.redis.del(`${this.CACHE_PREFIX}platform-stats`);

    return this.getProductById(id);
  }

  /**
   * Admin toggle product featured
   */
  async adminToggleProductFeatured(id: string, isFeatured: boolean) {
    const product = await this.prisma.products.findUnique({ where: { id } });
    if (!product) throw new Error('Product not found');

    await this.prisma.products.update({
      where: { id },
      data: { isFeatured },
    });

    // Invalidate cache
    await this.redis.del(`${this.CACHE_PREFIX}product-stats`);

    return this.getProductById(id);
  }

  /**
   * Export products (no pagination) for CSV
   */
  async exportProducts(params: {
    status?: string;
    storeId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { status, storeId, startDate, endDate } = params;
    const where: any = {};

    if (status) where.status = status;
    if (storeId) where.storeId = storeId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const products = await this.prisma.products.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        nameAr: true,
        slug: true,
        price: true,
        salePrice: true,
        quantity: true,
        status: true,
        currency: true,
        sku: true,
        isFeatured: true,
        hasVariants: true,
        trackInventory: true,
        createdAt: true,
        updatedAt: true,
        stores: {
          select: { name: true },
        },
        product_categories: {
          select: { name: true },
        },
        _count: {
          select: { order_items: true, reviews: true, variants: true },
        },
      },
    });

    return {
      data: products.map((p) => ({
        name: p.name,
        nameAr: p.nameAr || '',
        slug: p.slug,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : '',
        quantity: p.quantity,
        status: p.status,
        currency: p.currency,
        sku: p.sku || '',
        isFeatured: p.isFeatured ? 'Yes' : 'No',
        hasVariants: p.hasVariants ? 'Yes' : 'No',
        storeName: p.stores?.name || '—',
        categoryName: p.product_categories?.name || '—',
        ordersCount: p._count?.order_items || 0,
        reviewsCount: p._count?.reviews || 0,
        variantsCount: p._count?.variants || 0,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      total: products.length,
    };
  }

  /**
   * Admin delete product
   */
  async adminDeleteProduct(id: string) {
    const product = await this.prisma.products.findUnique({ where: { id } });
    if (!product) throw new Error('Product not found');

    // Delete related records first
    await this.prisma.product_images.deleteMany({ where: { productId: id } });
    await this.prisma.product_variants.deleteMany({ where: { productId: id } });
    await this.prisma.product_attributes.deleteMany({ where: { productId: id } });
    await this.prisma.products.delete({ where: { id } });

    // Invalidate cache
    await this.redis.del(`${this.CACHE_PREFIX}product-stats`);
    await this.redis.del(`${this.CACHE_PREFIX}platform-stats`);

    return { success: true };
  }
}
