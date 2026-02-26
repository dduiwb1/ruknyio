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
}
