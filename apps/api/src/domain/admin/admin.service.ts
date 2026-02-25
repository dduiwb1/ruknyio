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
}
