import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma/prisma.service';
import { RedisService } from '../../core/cache/redis.service';

@Injectable()
export class AdminService {
  private readonly CACHE_PREFIX = 'admin:';
  private readonly CACHE_TTL = 120; // 2 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
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

  /**
   * Recent users list for admin
   */
  async getRecentUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          emailVerified: true,
          profileCompleted: true,
          lastLoginAt: true,
          createdAt: true,
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
            },
          },
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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
}
