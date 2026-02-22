'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, Plus, RefreshCw, AlertCircle, Package, CheckCircle2, ShoppingCart, TrendingUp, TrendingDown, AlertTriangle, DollarSign, ArrowUp } from 'lucide-react';
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
    { key: 'products', title: 'إجمالي المنتجات', value: 0 },
    { key: 'active', title: 'المنتجات النشطة', value: 0 },
    { key: 'orders', title: 'الطلبات', value: 0, highlight: true },
    { key: 'sales', title: 'المبيعات', value: 0 },
    { key: 'lowStock', title: 'نفاد المخزون', value: 0 },
    { key: 'revenue', title: 'العائد', value: 0, isCurrency: true },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat, index) => {
        const change = 0;
        const trend = change >= 0 ? 'up' : 'down';
        
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`rounded-2xl p-4 sm:p-5 ${
              stat.highlight 
                ? "bg-[#c8e972]/20 dark:bg-[#c8e972]/10" 
                : "bg-muted/30 dark:bg-muted/20"
            }`}
          >
            {/* Title */}
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">{stat.title}</p>

            {/* Value */}
            <h3 className="text-xl sm:text-2xl font-bold text-foreground tabular-nums mb-1">
              {stat.isCurrency ? `${stat.value} د.ع` : stat.value.toLocaleString()}
            </h3>

            {/* Change with Trend */}
            <div className="flex items-center gap-1.5">
              {trend === 'up' ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span className={`text-xs font-medium ${
                trend === 'up' ? "text-emerald-500" : "text-rose-500"
              }`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function StoreStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-muted/30 p-4 sm:p-5 animate-pulse">
          <div className="h-3 w-16 bg-muted rounded mb-3" />
          <div className="h-6 w-12 bg-muted rounded mb-2" />
          <div className="h-3 w-10 bg-muted rounded" />
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
