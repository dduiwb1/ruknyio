'use client';

/**
 * 📦 Recent Orders Component
 * قائمة آخر الطلبات - تصميم متناسق
 */

import { Package, Clock, CheckCircle2, XCircle, Truck, ShoppingBag, ArrowUpRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface OrderItem {
  productName: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface RecentOrdersProps {
  orders: Order[];
  formatCurrency: (amount: number) => string;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; colorBg: string; colorText: string }> = {
  PENDING: { label: 'معلق', icon: Clock, colorBg: 'bg-warning/10', colorText: 'text-warning' },
  PROCESSING: { label: 'قيد المعالجة', icon: Loader2, colorBg: 'bg-info/10', colorText: 'text-info' },
  SHIPPED: { label: 'تم الشحن', icon: Truck, colorBg: 'bg-violet-500/10', colorText: 'text-violet-600 dark:text-violet-400' },
  COMPLETED: { label: 'مكتمل', icon: CheckCircle2, colorBg: 'bg-success/10', colorText: 'text-success' },
  CANCELLED: { label: 'ملغي', icon: XCircle, colorBg: 'bg-destructive/10', colorText: 'text-destructive' },
};

function getStatusConfig(status: string) {
  return statusConfig[status.toUpperCase()] || statusConfig.PENDING;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  return `منذ ${diffDays} يوم`;
}

export function RecentOrders({ orders, formatCurrency }: RecentOrdersProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-4xl border border-border/50 bg-card">
        <div className="flex items-center gap-3 p-4 border-b border-border/50">
          <div className="p-2 rounded-lg bg-info/10">
            <ShoppingBag className="w-4 h-4 text-info" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">آخر الطلبات</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="p-4 rounded-xl bg-muted/40 mb-3">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">لا توجد طلبات</p>
          <p className="text-xs text-muted-foreground">ستظهر الطلبات هنا</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-4xl border border-border/50 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-info/10">
            <ShoppingBag className="w-4 h-4 text-info" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">آخر الطلبات</h3>
            <p className="text-xs text-muted-foreground">{orders.length} طلبات</p>
          </div>
        </div>
        <Link
          href="/app/store/orders"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
        >
          عرض الكل
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-border/40">
        {orders.map((order) => {
          const config = getStatusConfig(order.status);
          const StatusIcon = config.icon;

          return (
            <div key={order.id} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn("p-2 rounded-lg", config.colorBg)}>
                    <StatusIcon className={cn("w-4 h-4", config.colorText)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">#{order.orderNumber}</span>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-md font-medium", config.colorBg, config.colorText)}>{config.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{order.customerName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{order.items.length} منتج</span>
                      <span>•</span>
                      <span>{formatTimeAgo(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-bold tabular-nums text-success">
                  {formatCurrency(order.total)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RecentOrdersSkeleton() {
  return (
    <div className="rounded-4xl border border-border/50 bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="h-3 w-12 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-7 w-16 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="divide-y divide-border/40">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                <div className="h-3 w-32 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
