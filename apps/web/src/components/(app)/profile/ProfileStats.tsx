'use client';

import { memo, useMemo } from 'react';
import { motion, type Variants, type TargetAndTransition } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Link2, 
  FolderOpen, 
  Eye,
  TrendingUp,
  type LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface ProfileStatConfig {
  id: 'links' | 'groups' | 'views';
  titleAr: string;
  subtitleAr: string;
  href: string;
  icon: LucideIcon;
  colors: {
    bg: string;
    hoverBg: string;
    text: string;
    iconBg: string;
    skeleton: string;
  };
  ariaLabel: string;
}

interface ProfileStatsProps {
  linksCount: number;
  groupsCount: number;
  viewsCount: number;
  isLoading?: boolean;
}

// ============================================
// Constants
// ============================================

const EMPTY_ANIMATION: TargetAndTransition = {};
const HOVER_ANIMATION: TargetAndTransition = { scale: 1.02, y: -4 };
const TAP_ANIMATION: TargetAndTransition = { scale: 0.98 };

const CARD_BASE_CLASSES = [
  'relative rounded-2xl p-4 sm:p-5',
  'text-right group w-full',
  'border border-white/50',
  'shadow-md hover:shadow-xl',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  'focus-visible:ring-primary',
  'overflow-hidden',
] as const;

const PROFILE_STATS_CONFIG: ProfileStatConfig[] = [
  {
    id: 'links',
    titleAr: 'الروابط',
    subtitleAr: 'روابط التواصل',
    href: '/app/profile/links',
    icon: Link2,
    colors: {
      bg: 'bg-gradient-to-br from-warning/30 to-warning/10',
      hoverBg: 'hover:from-warning/40 hover:to-warning/20',
      text: 'text-foreground',
      iconBg: 'bg-card/70',
      skeleton: 'bg-warning/30',
    },
    ariaLabel: 'عرض الروابط',
  },
  {
    id: 'groups',
    titleAr: 'المجموعات',
    subtitleAr: 'تنظيم الروابط',
    href: '/app/profile/links',
    icon: FolderOpen,
    colors: {
      bg: 'bg-gradient-to-br from-primary/25 to-primary/10',
      hoverBg: 'hover:from-primary/35 hover:to-primary/15',
      text: 'text-foreground',
      iconBg: 'bg-card/70',
      skeleton: 'bg-primary/20',
    },
    ariaLabel: 'عرض المجموعات',
  },
  {
    id: 'views',
    titleAr: 'المشاهدات',
    subtitleAr: 'مشاهدات الملف',
    href: '/app/profile',
    icon: Eye,
    colors: {
      bg: 'bg-gradient-to-br from-muted to-muted/50',
      hoverBg: 'hover:from-muted/80 hover:to-muted/40',
      text: 'text-foreground',
      iconBg: 'bg-card/70',
      skeleton: 'bg-muted',
    },
    ariaLabel: 'عرض الإحصائيات',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
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
// Icons
// ============================================

const ArrowUpRightIcon = memo(function ArrowUpRightIcon() {
  return (
    <svg 
      className="w-4 h-4" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17L17 7M17 7H9M17 7V15" />
    </svg>
  );
});

// ============================================
// Format Number
// ============================================

function formatStatNumber(num: number): string {
  if (!Number.isFinite(num) || num < 0) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 10_000) return `${Math.round(num / 1_000)}K`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return num.toLocaleString('en-US');
}

// ============================================
// Skeleton Component
// ============================================

const StatCardSkeleton = memo(function StatCardSkeleton({ color }: { color: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl p-5 sm:p-6',
        'border border-card/40',
        'shadow-sm animate-pulse',
        color
      )}
      role="status"
      aria-busy="true"
    >
      <div className="h-4 bg-card/60 rounded-md w-24 mb-2.5" />
      <div className="h-3 bg-card/40 rounded-md w-16 mb-4" />
      <div className="flex items-end justify-between">
        <div className="h-9 bg-card/60 rounded-lg w-16" />
        <div className="h-8 w-8 bg-card/40 rounded-full" />
      </div>
    </div>
  );
});

// ============================================
// Stat Card Component
// ============================================

interface StatItemProps {
  config: ProfileStatConfig;
  value: number;
  onClick: () => void;
}

const StatItem = memo(function StatItem({ config, value, onClick }: StatItemProps) {
  const { colors, titleAr, subtitleAr, ariaLabel, icon: Icon } = config;
  
  const formattedValue = useMemo(() => formatStatNumber(value), [value]);
  
  const buttonAriaLabel = useMemo(
    () => `${titleAr}: ${value.toLocaleString('ar-SA')}. اضغط ${ariaLabel}`,
    [titleAr, value, ariaLabel]
  );

  return (
    <motion.button
      variants={itemVariants}
      onClick={onClick}
      whileHover={HOVER_ANIMATION}
      whileTap={TAP_ANIMATION}
      layout={false}
      className={cn(
        ...CARD_BASE_CLASSES,
        'transition-all duration-300 ease-out',
        colors.bg,
        colors.hoverBg
      )}
      aria-label={buttonAriaLabel}
      type="button"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Background decoration */}
      <div 
        className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-card/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Title */}
      <p 
        className={cn(
          'text-xs sm:text-sm font-bold tracking-wide mb-0.5 truncate',
          colors.text
        )}
        aria-hidden="true"
      >
        {titleAr}
      </p>

      {/* Subtitle */}
      <p 
        className="text-[10px] sm:text-xs text-muted-foreground mb-3 truncate font-medium" 
        aria-hidden="true"
      >
        {subtitleAr}
      </p>

      {/* Value & Icon Row */}
      <div className="flex items-end justify-between gap-2">
        {/* Value */}
        <span 
          className={cn(
            'text-2xl sm:text-3xl font-bold tabular-nums tracking-tight leading-none',
            colors.text
          )}
          aria-hidden="true"
        >
          {formattedValue}
        </span>

        {/* Icon - Enhanced */}
        <span 
          className={cn(
            'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center',
            colors.iconBg,
            'shadow-sm group-hover:shadow-md transition-shadow'
          )}
        >
          <Icon className={cn('w-4 h-4 sm:w-5 sm:h-5', colors.text)} />
        </span>
      </div>

      {/* Hover Arrow - Enhanced */}
      <span
        className={cn(
          'absolute top-3 left-3',
          'w-6 h-6 rounded-lg bg-card/50 flex items-center justify-center',
          'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
          'transition-all duration-200 ease-out',
          'group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
          colors.text
        )}
        aria-hidden="true"
      >
        <ArrowUpRightIcon />
      </span>

      {/* Gradient overlay on hover */}
      <div 
        className={cn(
          'absolute inset-0 rounded-2xl pointer-events-none',
          'bg-gradient-to-br from-card/0 to-card/30',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-300'
        )}
        aria-hidden="true"
      />
    </motion.button>
  );
});

// ============================================
// Main Component
// ============================================

export const ProfileStats = memo(function ProfileStats({
  linksCount,
  groupsCount,
  viewsCount,
  isLoading = false,
}: ProfileStatsProps) {
  const router = useRouter();
  
  const statsValues = useMemo(() => ({
    links: linksCount,
    groups: groupsCount,
    views: viewsCount,
  }), [linksCount, groupsCount, viewsCount]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {PROFILE_STATS_CONFIG.map((config) => (
          <StatCardSkeleton key={config.id} color={config.colors.skeleton} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-3 gap-3 sm:gap-4"
    >
      {PROFILE_STATS_CONFIG.map((config) => (
        <StatItem
          key={config.id}
          config={config}
          value={statsValues[config.id]}
          onClick={() => router.push(config.href)}
        />
      ))}
    </motion.div>
  );
});

export default ProfileStats;
