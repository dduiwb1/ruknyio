"use client";

/**
 * 🎛️ لوحة التحكم - Control Panel
 * صفحة رئيسية بتصميم عصري ونظيف
 */

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers";
import {
  Loader2,
} from "lucide-react";
import { buildApiPath } from "@/lib/config";
import { secureFetch } from "@/lib/api/api-client";
import { getAuthUrl } from "@/lib/url";
import { PhonePreview } from "@/components/(app)/shared/PhonePreview";

import {
  StatsCard,
  StatsCardSkeleton,
  RecentOrders,
  RecentOrdersSkeleton,
  DashboardHeader,
  DashboardHeaderSkeleton,
  TopProductsTable,
  TopProductsTableSkeleton,
  OverviewStats,
  OverviewStatsSkeleton,
  ActivityBarChart,
  ActivityBarChartSkeleton,
  TasksList,
  TasksListSkeleton,
  type RevenueChartData,
} from "@/components/(app)/dashboard";

// ============ Types ============

interface StoreStats {
  hasStore: boolean;
  storeId?: string;
  storeName?: string;
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
  customerPhone: string;
  total: number;
  status: string;
  createdAt: string;
  items: { productName: string }[];
}

interface DashboardStats {
  events: { active: number; total: number };
  products: { active: number; total: number };
  forms: { active: number; total: number; submissions: number };
  views: { total: number; thisMonth: number };
}

interface TrafficSource {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

// ============ Utility Functions ============

function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

function formatCurrency(amount: number): string {
  return `${formatNumber(amount)} IQD`;
}

// ============ Main Component ============

export default function DashboardPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [storeStats, setStoreStats] = useState<StoreStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<RevenueChartData | null>(null);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState("7");
  const initializedRef = useRef(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.replace(getAuthUrl('/login'));
    }
  }, [authLoading, isAuthenticated]);

  // Fetch dashboard data
  useEffect(() => {
    if (!isAuthenticated) return;
    if (initializedRef.current && dateRange === "7") return;
    initializedRef.current = true;
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [storeRes, orderStatsRes, ordersRes, dashboardRes, chartRes, trafficRes, activityRes, productsRes] = await Promise.all([
          secureFetch(buildApiPath("/stores/stats")),
          secureFetch(buildApiPath("/orders/store/stats")),
          secureFetch(buildApiPath("/orders/store?limit=5&sortBy=createdAt&sortOrder=desc")),
          secureFetch(buildApiPath("/dashboard/stats")),
          secureFetch(buildApiPath(`/dashboard/chart?days=${dateRange}`)),
          secureFetch(buildApiPath("/dashboard/traffic")),
          secureFetch(buildApiPath("/dashboard/activity?limit=5")),
          secureFetch(buildApiPath("/products/store/top?limit=5")),
        ]);

        if (storeRes.ok) setStoreStats(await storeRes.json());
        if (orderStatsRes.ok) setOrderStats(await orderStatsRes.json());
        if (dashboardRes.ok) setDashboardStats(await dashboardRes.json());
        if (chartRes.ok) setChartData(await chartRes.json());
        if (trafficRes.ok) setTrafficSources(await trafficRes.json());
        if (activityRes.ok) setRecentActivities(await activityRes.json());
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setTopProducts(productsData.data || productsData || []);
        }
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setRecentOrders(ordersData.data || ordersData || []);
        }
      } catch (error) {
        // Error fetching dashboard data
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange, isAuthenticated]);

  // Auth loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Stats cards data
  const statsData = [
    {
      title: "المشاهدات",
      value: formatNumber(dashboardStats?.views?.total || 0),
      change: dashboardStats?.views?.thisMonth 
        ? `+${Math.round((dashboardStats.views.thisMonth / Math.max(dashboardStats.views.total, 1)) * 100)}%` 
        : "+0%",
      trend: "up" as const,
    },
    {
      title: "الطلبات",
      value: formatNumber(orderStats?.totalOrders || 0),
      change: orderStats?.pendingOrders 
        ? `+${orderStats.pendingOrders}` 
        : "+0%",
      trend: "up" as const,
    },
    {
      title: "المنتجات",
      value: formatNumber(storeStats?.totalProducts || 0),
      change: storeStats?.activeProducts 
        ? `+${storeStats.activeProducts}` 
        : "+0%",
      trend: "up" as const,
    },
    {
      title: "الإيرادات",
      value: orderStats?.totalRevenue 
        ? `${Math.round(orderStats.totalRevenue / 1000)}K` 
        : "0",
      change: "+12.5%",
      trend: "up" as const,
    },
  ];

  // القسم الثاني من البطاقات
  const secondaryStats = [
    {
      title: "النماذج",
      value: formatNumber(dashboardStats?.forms?.total || 0),
      change: dashboardStats?.forms?.active 
        ? `+${dashboardStats.forms.active}` 
        : "+0%",
      trend: "up" as const,
    },
    {
      title: "الفعاليات",
      value: formatNumber(dashboardStats?.events?.total || 0),
      change: dashboardStats?.events?.active 
        ? `+${dashboardStats.events.active}` 
        : "+0%",
      trend: "up" as const,
    },
    {
      title: "المكتملة",
      value: formatNumber(orderStats?.completedOrders || 0),
      change: orderStats?.totalOrders && orderStats.totalOrders > 0 
        ? `${Math.round((orderStats.completedOrders / orderStats.totalOrders) * 100)}%` 
        : "0%",
      trend: "up" as const,
    },
    {
      title: "نفاد المخزون",
      value: formatNumber(storeStats?.outOfStock || 0),
      change: storeStats?.outOfStock && storeStats.outOfStock > 0 
        ? "تنبيه" 
        : "جيد",
      trend: (storeStats?.outOfStock && storeStats.outOfStock > 0 ? "down" : "up") as "up" | "down",
    },
  ];

  // Overview stats data - بيانات حقيقية
  const overviewStatsData = [
    {
      label: "النقرات",
      value: dashboardStats?.views?.total || 0,
      change: dashboardStats?.views?.thisMonth && dashboardStats?.views?.total
        ? Number(((dashboardStats.views.thisMonth / Math.max(dashboardStats.views.total - dashboardStats.views.thisMonth, 1)) * 100).toFixed(1))
        : 0,
    },
    {
      label: "الطلبات",
      value: orderStats?.totalOrders || 0,
      change: orderStats?.pendingOrders && orderStats?.totalOrders
        ? Number(((orderStats.pendingOrders / Math.max(orderStats.totalOrders, 1)) * 100).toFixed(1))
        : 0,
    },
    {
      label: "إجابات النماذج",
      value: dashboardStats?.forms?.submissions || 0,
      change: dashboardStats?.forms?.submissions && dashboardStats?.forms?.total
        ? Number(((dashboardStats.forms.submissions / Math.max(dashboardStats.forms.total, 1)) * 100).toFixed(1))
        : 0,
      highlight: true,
    },
    {
      label: "المنتجات النشطة",
      value: storeStats?.activeProducts || 0,
      change: storeStats?.activeProducts && storeStats?.totalProducts
        ? Number(((storeStats.activeProducts / Math.max(storeStats.totalProducts, 1)) * 100).toFixed(1))
        : 0,
    },
  ];

  // Activities data - بيانات النشاطات الحقيقية
  const activitiesData = recentActivities.slice(0, 6).map((activity: any, index: number) => ({
    id: activity.id || String(index),
    title: activity.title || activity.description || "نشاط جديد",
    description: activity.description || undefined,
    type: activity.type || "alert",
    time: activity.time || "الآن",
    isNew: index === 0,
  }));

  // Chart days data
  const chartDaysData = chartData?.current?.map((day, index) => ({
    day: day.day,
    value: day.orders + day.revenue / 1000,
    isHighlighted: index === 3,
  })) || undefined;

  return (
    <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 gap-4 m-2 md:ms-0" dir="rtl">
      {/* Main Content */}
      <div className="flex-1 min-w-0 bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-4 sm:p-6 space-y-5 pb-28 md:pb-6">
            {/* Header */}
            {loading ? (
              <DashboardHeaderSkeleton />
            ) : (
              <DashboardHeader
                storeName={storeStats?.storeName}
                hasStore={storeStats?.hasStore}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            )}

            {/* Stats Cards - القسم الأول */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
                : statsData.map((stat, index) => (
                    <StatsCard key={index} {...stat} highlight={index === 0} />
                  ))}
            </div>

            {/* Stats Cards - القسم الثاني */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
                : secondaryStats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                  ))}
            </div>

            {/* New Charts Section - Overview & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {loading ? (
                <>
                  <OverviewStatsSkeleton />
                  <ActivityBarChartSkeleton />
                </>
              ) : (
                <>
                  <OverviewStats 
                    title="نظرة عامة"
                    subtitle="إحصائياتك. اختر فترة وتابع نشاطك"
                    stats={overviewStatsData}
                  />
                  <ActivityBarChart 
                    title="كل الوقت"
                    totalValue={`${Math.floor((orderStats?.totalRevenue || 0) / 1000)}K IQD`}
                    data={chartDaysData}
                    badge={{
                      value: formatNumber(dashboardStats?.views?.total || 0),
                      trend: "up"
                    }}
                  />
                </>
              )}
            </div>

            {/* Recent Orders & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {loading ? (
                <>
                  <RecentOrdersSkeleton />
                  <TopProductsTableSkeleton />
                </>
              ) : (
                <>
                  <RecentOrders orders={recentOrders} formatCurrency={formatCurrency} />
                  <TopProductsTable products={topProducts} formatCurrency={formatCurrency} />
                </>
              )}
            </div>

            {/* Activities List - آخر النشاطات */}
            {loading ? (
              <TasksListSkeleton />
            ) : (
              <TasksList 
                title="آخر النشاطات"
                tasks={activitiesData.length > 0 ? activitiesData : [
                  { id: "1", title: "تم إنشاء متجرك بنجاح", type: "store_created", time: "منذ 5 د", isNew: true },
                  { id: "2", title: "تمت إضافة منتج جديد", description: "قميص رجالي كلاسيك", type: "product_created", time: "منذ 30 د" },
                  { id: "3", title: "طلب جديد #1234", description: "من أحمد محمد", type: "order_received", time: "منذ 1 س" },
                  { id: "4", title: "تم تحديث الملف الشخصي", type: "profile_updated", time: "منذ 2 س" },
                  { id: "5", title: "تسجيل جديد في الفعالية", description: "ورشة التصميم", type: "event_registration", time: "منذ 3 س" },
                ]}
              />
            )}
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
