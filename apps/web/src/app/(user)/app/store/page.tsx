'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Plus, RefreshCw, AlertCircle, Package, CheckCircle2, ShoppingCart, TrendingUp, AlertTriangle, DollarSign, ArrowUp } from 'lucide-react';
import { PhonePreview } from '@/components/(app)/shared/PhonePreview';

export default function StorePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasStore, setHasStore] = useState(false);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 gap-4 m-2 md:ms-0" dir="rtl">
      {/* Main Content */}
      <div className="flex-1 min-w-0 bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-4 sm:p-6 space-y-5 pb-28 md:pb-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  المتجر
                </h1>
                <p className="text-sm text-muted-foreground">
                  إدارة المنتجات والطلبات
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">تحديث</span>
              </button>

              <button
                type="button"
                onClick={() => {}}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div>
            {isLoading ? (
              <StoreStatsSkeleton />
            ) : (
              <StoreStats />
            )}
          </div>

          {/* Content */}
          <div>
            {isLoading ? (
              <StoreContentSkeleton />
            ) : !hasStore ? (
              <EmptyStoreState />
            ) : (
              <StoreContent />
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

// ============ Stats Component ============

function StoreStats() {
  const stats = [
    {
      title: 'إجمالي المنتجات',
      value: '0',
      bgColor: 'bg-sky-50 dark:bg-sky-950/30',
      iconBg: 'bg-sky-500',
      icon: Package,
      change: '+12',
      changeLabel: 'منتج جديد',
    },
    {
      title: 'المنتجات النشطة',
      value: '0',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconBg: 'bg-emerald-500',
      icon: CheckCircle2,
      change: '+8.5%',
      changeLabel: 'هذا الأسبوع',
    },
    {
      title: 'الطلبات الجديدة',
      value: '0',
      bgColor: 'bg-violet-50 dark:bg-violet-950/30',
      iconBg: 'bg-violet-500',
      icon: ShoppingCart,
      change: '+23',
      changeLabel: 'طلب جديد',
    },
    {
      title: 'إجمالي المبيعات',
      value: '0',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      iconBg: 'bg-amber-500',
      icon: TrendingUp,
      change: '+15%',
      changeLabel: 'هذا الشهر',
    },
    {
      title: 'المحتاجة لإعادة التخزين',
      value: '0',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30',
      iconBg: 'bg-rose-500',
      icon: AlertTriangle,
      change: '3',
      changeLabel: 'تحتاج انتباه',
    },
    {
      title: 'العائد هذا الشهر',
      value: '0 د.ع',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
      iconBg: 'bg-indigo-500',
      icon: DollarSign,
      change: '+25%',
      changeLabel: 'عن الشهر السابق',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className={`${stat.bgColor} rounded-2xl p-5 flex items-start gap-4 hover:brightness-95 dark:hover:brightness-110 transition-all`}
          >
            {/* Icon */}
            <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1.5">{stat.title}</p>
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold text-foreground tabular-nums">
                  {stat.value}
                </div>
                {stat.change && (
                  <div className="flex items-center gap-1 mb-0.5">
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <ArrowUp className="w-3 h-3" />
                      <span className="text-xs font-semibold">{stat.change}</span>
                    </div>
                  </div>
                )}
              </div>
              {stat.changeLabel && (
                <p className="text-xs text-muted-foreground/80 mt-1">{stat.changeLabel}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StoreStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-card dark:bg-card/50 rounded-2xl p-5 flex items-start gap-4 animate-pulse"
        >
          {/* Icon Skeleton */}
          <div className="w-12 h-12 rounded-xl bg-muted/50" />

          {/* Content Skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded bg-muted/50" />
            <div className="h-8 w-20 rounded bg-muted/50" />
            <div className="h-2.5 w-16 rounded bg-muted/30" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============ Empty State ============

function EmptyStoreState() {
  return (
    <div className="rounded-xl border border-border bg-card p-12 text-center">
      <div className="w-16 h-16 rounded-lg bg-warning/10 flex items-center justify-center mx-auto mb-4">
        <Store className="w-8 h-8 text-warning" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">
        ابدأ متجرك الآن
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
        قم بإنشاء متجرك الإلكتروني وابدأ ببيع منتجاتك بسهولة
      </p>
      <button
        type="button"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>إنشاء متجر</span>
      </button>
    </div>
  );
}

// ============ Store Content ============

function StoreContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Recent Products */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">
            المنتجات الأخيرة
          </h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            0 منتج
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-2">
            <Store className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            لا توجد منتجات
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">
            الطلبات الأخيرة
          </h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            0 طلب
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-2">
            <Store className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            لا توجد طلبات
          </p>
        </div>
      </div>
    </div>
  );
}

function StoreContentSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-5 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-28 rounded bg-muted" />
            <div className="h-5 w-12 rounded bg-muted" />
          </div>
          <div className="space-y-2 py-8">
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-3/4 rounded bg-muted mx-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
