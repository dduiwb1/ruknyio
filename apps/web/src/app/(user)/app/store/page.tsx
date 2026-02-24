'use client';

/**
 * 🏪 صفحة المتجر - Store Management
 * إدارة المتجر مع إحصائيات ومنتجات وطلبات
 * متوافق مع تصميم لوحة التحكم
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  Plus,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Loader2,
  ChevronLeft,
  LayoutDashboard,
  ArrowUpLeft,
  ShoppingBag,
  BarChart3,
  Settings,
  Copy,
  Check,
  Tag,
  Boxes,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/providers';
import { buildApiPath } from '@/lib/config';
import { secureFetch } from '@/lib/api/api-client';
import { PhonePreview } from '@/components/(app)/shared/PhonePreview';
import { cn } from '@/lib/utils';

// ============ Types ============

interface StoreStats {
  hasStore: boolean;
  storeId?: string;
  storeName?: string;
  storeSlug?: string;
  storeStatus?: string;
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  totalOrders: number;
  totalRevenue: number;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  total: number;
  status: string;
  createdAt: string;
  items: { productName: string }[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  amount: number;
  isActive: boolean;
  images?: { url: string }[];
}

// ============ Utilities ============

function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

function formatCurrency(amount: number): string {
  return `${formatNumber(amount)} IQD`;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} د`;
  if (diffHours < 24) return `منذ ${diffHours} س`;
  return `منذ ${diffDays} ي`;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  PENDING: { label: 'معلق', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  PROCESSING: { label: 'قيد المعالجة', icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  SHIPPED: { label: 'تم الشحن', icon: Truck, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  COMPLETED: { label: 'مكتمل', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  DELIVERED: { label: 'تم التسليم', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  CANCELLED: { label: 'ملغي', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
};

function getStatusConfig(status: string) {
  return statusConfig[status?.toUpperCase()] || statusConfig.PENDING;
}

// ============ Main Component ============

export default function StorePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [copied, setCopied] = useState(false);
  const initializedRef = useRef(false);

  // Fetch store data
  useEffect(() => {
    if (!isAuthenticated || initializedRef.current) return;
    initializedRef.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [storeRes, orderStatsRes, ordersRes, productsRes] = await Promise.all([
          secureFetch(buildApiPath('/stores/stats')),
          secureFetch(buildApiPath('/orders/store/stats')),
          secureFetch(buildApiPath('/orders/store?limit=5&sortBy=createdAt&sortOrder=desc')),
          secureFetch(buildApiPath('/products/store/top?limit=5')),
        ]);

        if (storeRes.ok) setStoreStats(await storeRes.json());
        if (orderStatsRes.ok) setOrderStats(await orderStatsRes.json());
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setRecentOrders(data.data || data || []);
        }
        if (productsRes.ok) {
          const data = await productsRes.json();
          setTopProducts(data.data || data || []);
        }
      } catch (error) {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleCopyLink = useCallback(() => {
    const slug = storeStats?.storeSlug || storeStats?.storeName;
    if (slug) {
      navigator.clipboard.writeText(`https://rukny.io/store/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [storeStats]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Stats data
  const statsData = [
    {
      title: 'إجمالي المنتجات',
      value: formatNumber(storeStats?.totalProducts || 0),
      icon: Package,
      change: storeStats?.activeProducts
        ? `${storeStats.activeProducts} نشط`
        : '0 نشط',
      trend: 'up' as const,
      highlight: true,
    },
    {
      title: 'الطلبات',
      value: formatNumber(orderStats?.totalOrders || storeStats?.totalOrders || 0),
      icon: ShoppingCart,
      change: orderStats?.pendingOrders
        ? `${orderStats.pendingOrders} بانتظار`
        : '0 بانتظار',
      trend: 'up' as const,
    },
    {
      title: 'الإيرادات',
      value: orderStats?.totalRevenue
        ? `${Math.round(orderStats.totalRevenue / 1000)}K`
        : '0',
      icon: DollarSign,
      change: 'IQD',
      trend: 'up' as const,
    },
    {
      title: 'نفاد المخزون',
      value: formatNumber(storeStats?.outOfStock || 0),
      icon: AlertTriangle,
      change: storeStats?.outOfStock && storeStats.outOfStock > 0 ? 'تنبيه' : 'جيد',
      trend: (storeStats?.outOfStock && storeStats.outOfStock > 0 ? 'down' : 'up') as 'up' | 'down',
    },
  ];

  // Order summary data
  const orderSummary = [
    { label: 'بانتظار', value: orderStats?.pendingOrders || 0, color: 'text-amber-500' },
    { label: 'قيد المعالجة', value: orderStats?.processingOrders || 0, color: 'text-blue-500' },
    { label: 'مكتملة', value: orderStats?.completedOrders || 0, color: 'text-emerald-500' },
    { label: 'ملغاة', value: orderStats?.cancelledOrders || 0, color: 'text-rose-500' },
  ];

  return (
    <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 gap-4 m-2 md:ms-0" dir="rtl">
      {/* Main Content */}
      <div className="flex-1 min-w-0 bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-4 sm:p-6 space-y-5 pb-28 md:pb-6">

            {/* Header */}
            {loading ? (
              <HeaderSkeleton />
            ) : (
              <StoreHeader
                storeName={storeStats?.storeName}
                storeSlug={storeStats?.storeSlug}
                copied={copied}
                onCopyLink={handleCopyLink}
              />
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
                : statsData.map((stat, index) => (
                    <StoreStatsCard key={stat.title} {...stat} index={index} />
                  ))
              }
            </div>

            {/* Quick Actions */}
            {!loading && <QuickActions />}

            {/* Order Summary & Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {loading ? (
                <>
                  <SectionSkeleton />
                  <SectionSkeleton />
                </>
              ) : (
                <>
                  <OrderSummaryCard summary={orderSummary} totalOrders={orderStats?.totalOrders || 0} />
                  <StoreOverviewCard storeStats={storeStats} orderStats={orderStats} />
                </>
              )}
            </div>

            {/* Recent Orders & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {loading ? (
                <>
                  <SectionSkeleton rows={4} />
                  <SectionSkeleton rows={4} />
                </>
              ) : (
                <>
                  <RecentOrdersList orders={recentOrders} />
                  <TopProductsList products={topProducts} />
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Phone Preview Sidebar - Desktop Only */}
      <div className="hidden xl:flex">
        <PhonePreview />
      </div>
    </div>
  );
}

// ============ Header ============

function StoreHeader({
  storeName,
  storeSlug,
  copied,
  onCopyLink,
}: {
  storeName?: string;
  storeSlug?: string;
  copied: boolean;
  onCopyLink: () => void;
}) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link href="/app" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <LayoutDashboard className="h-4 w-4" />
          <span>لوحة التحكم</span>
        </Link>
        <ChevronLeft className="h-4 w-4 text-muted-foreground/50 rotate-180" aria-hidden />
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-foreground" />
          <span className="font-medium text-foreground">{storeName || 'المتجر'}</span>
        </div>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Copy Store Link */}
        {storeSlug && (
          <button
            type="button"
            onClick={onCopyLink}
            className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                <span className="hidden sm:inline text-emerald-500">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">نسخ الرابط</span>
              </>
            )}
          </button>
        )}

        {/* Store Settings */}
        <Link
          href="/app/store/settings"
          className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">الإعدادات</span>
        </Link>

        {/* Add Product */}
        <Link
          href="/app/store/products/new"
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">إضافة منتج</span>
        </Link>
      </div>
    </header>
  );
}

function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-20 rounded bg-muted animate-pulse" />
        <div className="h-4 w-4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-14 rounded bg-muted animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-9 sm:w-28 rounded-lg bg-muted animate-pulse" />
        <div className="h-9 w-9 sm:w-24 rounded-lg bg-muted animate-pulse" />
        <div className="h-9 w-9 sm:w-28 rounded-lg bg-muted animate-pulse" />
      </div>
    </div>
  );
}

// ============ Stats Card ============

function StoreStatsCard({
  title,
  value,
  icon: Icon,
  change,
  trend,
  highlight,
  index,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  change: string;
  trend: 'up' | 'down';
  highlight?: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        'rounded-2xl p-4 sm:p-5',
        highlight
          ? 'bg-[#c8e972]/20 dark:bg-[#c8e972]/10'
          : 'bg-muted/30 dark:bg-muted/20'
      )}
    >
      {/* Title */}
      <p className="text-xs sm:text-sm text-muted-foreground mb-2">{title}</p>

      {/* Value */}
      <h3 className="text-xl sm:text-2xl font-bold text-foreground tabular-nums mb-1">
        {value}
      </h3>

      {/* Change with Trend */}
      <div className="flex items-center gap-1.5">
        {trend === 'up' ? (
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
        )}
        <span
          className={cn(
            'text-xs font-medium',
            trend === 'up' ? 'text-emerald-500' : 'text-rose-500'
          )}
        >
          {change}
        </span>
      </div>
    </motion.div>
  );
}

function StatsCardSkeleton() {
  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-muted/30">
      <div className="h-4 w-16 bg-muted/60 rounded animate-pulse mb-2" />
      <div className="h-7 w-20 bg-muted/60 rounded animate-pulse mb-2" />
      <div className="flex items-center gap-1.5">
        <div className="h-3.5 w-3.5 bg-muted/60 rounded animate-pulse" />
        <div className="h-3 w-10 bg-muted/60 rounded animate-pulse" />
      </div>
    </div>
  );
}

// ============ Quick Actions ============

function QuickActions() {
  const actions = [
    { icon: Package, label: 'المنتجات', href: '/app/store/products', color: 'bg-emerald-500' },
    { icon: ClipboardList, label: 'الطلبات', href: '/app/store/orders', color: 'bg-sky-500' },
    { icon: Tag, label: 'الكوبونات', href: '/app/store/coupons', color: 'bg-amber-500' },
    { icon: Boxes, label: 'التصنيفات', href: '/app/store/categories', color: 'bg-violet-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="flex items-center gap-3 rounded-2xl bg-muted/30 dark:bg-muted/20 p-4 hover:bg-muted/50 transition-colors group"
        >
          <div className={cn('p-2 rounded-xl', action.color)}>
            <action.icon className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-medium text-foreground group-hover:text-foreground/80">
            {action.label}
          </span>
        </Link>
      ))}
    </motion.div>
  );
}

// ============ Order Summary Card ============

function OrderSummaryCard({
  summary,
  totalOrders,
}: {
  summary: { label: string; value: number; color: string }[];
  totalOrders: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl bg-muted/30 p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">ملخص الطلبات</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            إجمالي {formatNumber(totalOrders)} طلب
          </p>
        </div>
        <Link
          href="/app/store/orders"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          عرض الكل
          <ArrowUpLeft className="w-3 h-3" />
        </Link>
      </div>

      {/* Summary Bars */}
      <div className="flex items-end justify-between gap-3 h-[180px]">
        {summary.map((item, index) => {
          const maxVal = Math.max(...summary.map((s) => s.value), 1);
          const heightPercent = totalOrders > 0 ? (item.value / maxVal) * 100 : 25;

          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-1 flex flex-col items-center"
            >
              <div
                className="relative w-full flex flex-col items-center justify-end"
                style={{ height: '140px' }}
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(heightPercent, 30)}%` }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
                  className={cn(
                    'w-full rounded-2xl flex flex-col items-center justify-start pt-2 px-1 min-h-[50px]',
                    index === 2
                      ? 'bg-[#c8e972] dark:bg-[#b8d962]'
                      : 'bg-muted/50 dark:bg-muted/30'
                  )}
                >
                  <span
                    className={cn(
                      'text-[9px] sm:text-[10px] whitespace-nowrap mb-0.5',
                      index === 2 ? 'text-foreground/70' : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      'text-sm sm:text-base font-bold',
                      index === 2 ? 'text-foreground' : 'text-foreground'
                    )}
                  >
                    {item.value.toLocaleString()}
                  </span>
                </motion.div>
              </div>

              <div className="flex items-center gap-1 mt-2">
                <span className={cn('text-xs font-medium', item.color)}>
                  {totalOrders > 0 ? `${Math.round((item.value / totalOrders) * 100)}%` : '0%'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============ Store Overview Card ============

function StoreOverviewCard({
  storeStats,
  orderStats,
}: {
  storeStats: StoreStats | null;
  orderStats: OrderStats | null;
}) {
  const overviewItems = [
    {
      label: 'المنتجات النشطة',
      value: storeStats?.activeProducts || 0,
      total: storeStats?.totalProducts || 0,
      icon: Package,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'الطلبات المكتملة',
      value: orderStats?.completedOrders || 0,
      total: orderStats?.totalOrders || 0,
      icon: CheckCircle2,
      color: 'text-sky-500',
      bg: 'bg-sky-500/10',
    },
    {
      label: 'نفاد المخزون',
      value: storeStats?.outOfStock || 0,
      total: storeStats?.totalProducts || 0,
      icon: AlertTriangle,
      color: storeStats?.outOfStock ? 'text-rose-500' : 'text-emerald-500',
      bg: storeStats?.outOfStock ? 'bg-rose-500/10' : 'bg-emerald-500/10',
    },
    {
      label: 'الإيرادات الكلية',
      value: orderStats?.totalRevenue || 0,
      total: 0,
      icon: DollarSign,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      isCurrency: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl bg-muted/30 p-5 sm:p-6"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-foreground">نظرة عامة</h3>
          <p className="text-sm text-muted-foreground mt-0.5">حالة متجرك الحالية</p>
        </div>
        <div className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-3">
        {overviewItems.map((item, index) => {
          const Icon = item.icon;
          const percentage =
            item.total > 0
              ? Math.round((item.value / item.total) * 100)
              : 0;

          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl bg-card',
                index === 0 && 'bg-[#c8e972]/20 dark:bg-[#c8e972]/10'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                  index === 0 ? 'bg-[#c8e972]' : item.bg
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4',
                    index === 0 ? 'text-foreground' : item.color
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                {!item.isCurrency && item.total > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-muted/60 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className={cn(
                          'h-full rounded-full',
                          index === 0 ? 'bg-[#c8e972]' : 'bg-primary/60'
                        )}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{percentage}%</span>
                  </div>
                )}
              </div>

              <div className="text-left shrink-0">
                <p className="text-sm font-bold text-foreground tabular-nums">
                  {item.isCurrency ? formatCurrency(item.value) : formatNumber(item.value)}
                </p>
                {!item.isCurrency && item.total > 0 && (
                  <p className="text-[10px] text-muted-foreground">من {formatNumber(item.total)}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============ Recent Orders List ============

function RecentOrdersList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl bg-muted/30 p-5 sm:p-6"
      >
        <h3 className="text-base font-bold text-foreground mb-4">آخر الطلبات</h3>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <ShoppingBag className="h-10 w-10 mb-2 opacity-30" />
          <p className="text-sm">لا توجد طلبات حالياً</p>
          <p className="text-xs text-muted-foreground/60 mt-1">ستظهر الطلبات الجديدة هنا</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl bg-muted/30 p-5 sm:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">آخر الطلبات</h3>
        <Link
          href="/app/store/orders"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          عرض الكل
          <ArrowUpLeft className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {orders.map((order, index) => {
          const config = getStatusConfig(order.status);
          const StatusIcon = config.icon;

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl bg-card',
                index === 0 && 'bg-[#c8e972]/20 dark:bg-[#c8e972]/10'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                  index === 0 ? 'bg-[#c8e972]' : 'bg-muted/60'
                )}
              >
                <StatusIcon
                  className={cn(
                    'w-4 h-4',
                    index === 0 ? 'text-foreground' : config.color
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    #{order.orderNumber}
                  </span>
                  <span className={cn('text-xs', config.color)}>{config.label}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {order.customerName} • {order.items.length} منتج
                </p>
              </div>

              <div className="text-left shrink-0">
                <p className="text-sm font-bold text-foreground tabular-nums">
                  {formatCurrency(order.total)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatTimeAgo(order.createdAt)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============ Top Products List ============

function TopProductsList({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl bg-muted/30 p-5 sm:p-6"
      >
        <h3 className="text-base font-bold text-foreground mb-4">المنتجات الأكثر مبيعاً</h3>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Package className="h-10 w-10 mb-2 opacity-30" />
          <p className="text-sm">لا توجد منتجات حالياً</p>
          <Link
            href="/app/store/products/new"
            className="mt-3 flex items-center gap-2 text-xs font-medium text-primary hover:underline"
          >
            <Plus className="w-3 h-3" />
            إضافة أول منتج
          </Link>
        </div>
      </motion.div>
    );
  }

  const totalAmount = products.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl bg-muted/30 p-5 sm:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-foreground">المنتجات الأكثر مبيعاً</h3>
          {totalAmount > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              إجمالي: {formatCurrency(totalAmount)}
            </p>
          )}
        </div>
        <Link
          href="/app/store/products"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          عرض الكل
          <ArrowUpLeft className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl bg-card',
              index === 0 && 'bg-[#c8e972]/20 dark:bg-[#c8e972]/10'
            )}
          >
            {/* Rank */}
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold',
                index === 0
                  ? 'bg-[#c8e972] text-foreground'
                  : index === 1
                    ? 'bg-muted/80 text-foreground'
                    : index === 2
                      ? 'bg-amber-500/20 text-amber-600'
                      : 'bg-muted/60 text-muted-foreground'
              )}
            >
              {index + 1}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(product.price)} × {product.quantity}
              </p>
            </div>

            <div className="text-left shrink-0">
              <p className="text-sm font-bold text-foreground tabular-nums">
                {formatCurrency(product.amount)}
              </p>
              <div className="flex items-center justify-end gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] text-emerald-500">{product.quantity} مبيعة</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ============ Skeletons ============

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-3xl bg-muted/30 p-5 sm:p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-5 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="h-4 w-16 bg-muted/60 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card">
            <div className="w-8 h-8 rounded-full bg-muted/60 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-24 bg-muted/60 rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted/60 rounded animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-16 bg-muted/60 rounded animate-pulse" />
              <div className="h-3 w-10 bg-muted/60 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
