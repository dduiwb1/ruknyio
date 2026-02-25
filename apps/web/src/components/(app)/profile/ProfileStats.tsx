'use client';

/**
 * 📊 Profile Stats Component
 * بطاقات إحصائيات متناسقة مع لوحة التحكم
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface ProfileStatsProps {
  linksCount: number;
  groupsCount: number;
  viewsCount: number;
  activeLinksCount?: number;
  totalClicks?: number;
  pinnedCount?: number;
  isLoading?: boolean;
}

// ============================================
// Config
// ============================================

const STATS_CONFIG = [
  { key: 'links', title: 'إجمالي الروابط' },
  { key: 'active', title: 'النشطة' },
  { key: 'clicks', title: 'النقرات', highlight: true },
  { key: 'views', title: 'المشاهدات' },
  { key: 'groups', title: 'المجموعات' },
  { key: 'pinned', title: 'المثبتة' },
];

// ============================================
// Utils
// ============================================

function formatNumber(num: number): string {
  if (!Number.isFinite(num) || num < 0) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 10_000) return `${Math.round(num / 1_000)}K`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return (num ?? 0).toLocaleString('en-US');
}

// ============================================
// Skeleton
// ============================================

function ProfileStatsSkeleton() {
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

// ============================================
// Main Component
// ============================================

export const ProfileStats = memo(function ProfileStats({
  linksCount,
  groupsCount,
  viewsCount,
  activeLinksCount = 0,
  totalClicks = 0,
  pinnedCount = 0,
  isLoading = false,
}: ProfileStatsProps) {
  const statsValues: Record<string, number> = {
    links: linksCount,
    active: activeLinksCount,
    groups: groupsCount,
    clicks: totalClicks,
    views: viewsCount,
    pinned: pinnedCount,
  };

  if (isLoading) {
    return <ProfileStatsSkeleton />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {STATS_CONFIG.map((stat, index) => {
        const value = statsValues[stat.key] || 0;
        const change = 0;
        const trend = change >= 0 ? 'up' : 'down';
        
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={cn(
              "rounded-2xl p-4 sm:p-5",
              stat.highlight 
                ? "bg-[#c8e972]/20 dark:bg-[#c8e972]/10" 
                : "bg-muted/30 dark:bg-muted/20"
            )}
          >
            {/* Title */}
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">{stat.title}</p>

            {/* Value */}
            <h3 className="text-xl sm:text-2xl font-bold text-foreground tabular-nums mb-1">
              {formatNumber(value)}
            </h3>

            {/* Change with Trend */}
            <div className="flex items-center gap-1.5">
              {trend === 'up' ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span className={cn(
                "text-xs font-medium",
                trend === 'up' ? "text-emerald-500" : "text-rose-500"
              )}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
});

export default ProfileStats;
