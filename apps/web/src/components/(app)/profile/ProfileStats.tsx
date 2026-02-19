'use client';

import { memo, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Link2,
  FolderOpen,
  Eye,
  MousePointerClick,
  Star,
  Zap,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface StatConfig {
  key: string;
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
  bgColor: string;
  hoverColor: string;
  textColor: string;
}

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
// Config - Same card style as FormsStats
// ============================================

const STATS_CONFIG: StatConfig[] = [
  {
    key: 'links',
    title: 'إجمالي الروابط',
    subtitle: 'روابط التواصل',
    href: '/app/profile/links',
    icon: Link2,
    bgColor: 'bg-amber-100',
    hoverColor: 'hover:bg-amber-200',
    textColor: 'text-amber-900',
  },
  {
    key: 'active',
    title: 'الروابط النشطة',
    subtitle: 'رابط فعّال',
    href: '/app/profile/links',
    icon: Zap,
    bgColor: 'bg-emerald-100',
    hoverColor: 'hover:bg-emerald-200',
    textColor: 'text-emerald-900',
  },
  {
    key: 'groups',
    title: 'المجموعات',
    subtitle: 'تنظيم الروابط',
    href: '/app/profile/links',
    icon: FolderOpen,
    bgColor: 'bg-sky-100',
    hoverColor: 'hover:bg-sky-200',
    textColor: 'text-sky-900',
  },
  {
    key: 'clicks',
    title: 'إجمالي النقرات',
    subtitle: 'نقرة',
    href: '/app/profile',
    icon: MousePointerClick,
    bgColor: 'bg-violet-100',
    hoverColor: 'hover:bg-violet-200',
    textColor: 'text-violet-900',
  },
  {
    key: 'views',
    title: 'إجمالي المشاهدات',
    subtitle: 'مشاهدة',
    href: '/app/profile',
    icon: Eye,
    bgColor: 'bg-rose-100',
    hoverColor: 'hover:bg-rose-200',
    textColor: 'text-rose-900',
  },
  {
    key: 'pinned',
    title: 'الروابط المثبتة',
    subtitle: 'رابط مثبت',
    href: '/app/profile/links',
    icon: Star,
    bgColor: 'bg-indigo-100',
    hoverColor: 'hover:bg-indigo-200',
    textColor: 'text-indigo-900',
  },
];

// ============================================
// Animation Variants
// ============================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    },
  },
};

// ============================================
// Utils
// ============================================

function formatNumber(num: number): string {
  if (!Number.isFinite(num) || num < 0) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 10_000) return `${Math.round(num / 1_000)}K`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return num.toLocaleString('en-US');
}

function calculateChange(
  current: number,
  total: number
): { change: string; isPositive: boolean } {
  if (total === 0 || current === 0) return { change: '0%', isPositive: true };
  const percentage = Math.round((current / total) * 100);
  return { change: `${percentage}%`, isPositive: percentage > 0 };
}

// ============================================
// Skeleton
// ============================================

const SKELETON_COLORS = [
  'bg-amber-100',
  'bg-emerald-100',
  'bg-sky-100',
  'bg-violet-100',
  'bg-rose-100',
  'bg-indigo-100',
];

function ProfileStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5">
      {SKELETON_COLORS.map((color, i) => (
        <div
          key={i}
          className={cn('rounded-xl p-3.5 sm:p-4 animate-pulse', color)}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="h-7 w-7 bg-white/50 rounded-lg" />
          </div>
          <div className="h-4 bg-white/50 rounded w-20 mb-1.5" />
          <div className="h-3 bg-white/30 rounded w-14 mb-2.5" />
          <div className="flex items-end justify-between">
            <div className="h-7 bg-white/50 rounded w-10" />
            <div className="h-4.5 bg-white/30 rounded-full w-12" />
          </div>
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
  const router = useRouter();

  const statsValues = useMemo(
    () => ({
      links: linksCount,
      active: activeLinksCount,
      groups: groupsCount,
      clicks: totalClicks,
      views: viewsCount,
      pinned: pinnedCount,
    }),
    [linksCount, activeLinksCount, groupsCount, totalClicks, viewsCount, pinnedCount]
  );

  if (isLoading) {
    return <ProfileStatsSkeleton />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5"
    >
      {STATS_CONFIG.map((stat) => {
        const value = statsValues[stat.key as keyof typeof statsValues] || 0;
        const change = calculateChange(
          stat.key === 'active' ? activeLinksCount : value,
          stat.key === 'active' ? linksCount : linksCount || 1
        );
        const Icon = stat.icon;

        return (
          <motion.button
            key={stat.key}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(stat.href)}
            type="button"
            className={cn(
              'relative rounded-xl p-3.5 sm:p-4',
              'transition-all duration-300',
              'text-right group w-full',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
              stat.bgColor,
              stat.hoverColor
            )}
          >
            {/* Icon */}
            <div className="flex items-center justify-between mb-2.5">
              <div
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center',
                  'bg-white/50'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', stat.textColor)} />
              </div>
            </div>

            {/* Title */}
            <p className={cn('text-[13px] font-semibold mb-0.5 truncate', stat.textColor)}>
              {stat.title}
            </p>

            {/* Subtitle */}
            <p className="text-[11px] text-gray-500 mb-2 truncate">{stat.subtitle}</p>

            {/* Value & Change Row */}
            <div className="flex items-end justify-between">
              {/* Value */}
              <span
                className={cn(
                  'text-xl sm:text-2xl font-bold tabular-nums tracking-tight leading-none',
                  stat.textColor
                )}
              >
                {formatNumber(value)}
              </span>

              {/* Change Indicator */}
              <div
                className={cn(
                  'flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-full',
                  change.isPositive
                    ? 'bg-white/50 text-gray-700'
                    : 'bg-red-100 text-red-600'
                )}
              >
                <span>~{change.change}</span>
                {change.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
});

export default ProfileStats;
