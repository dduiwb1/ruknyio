'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FormsStats as StatsType } from '@/lib/hooks/useForms';

interface FormsStatsProps {
  stats: StatsType;
  isLoading?: boolean;
}

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
    },
  },
};

const STATS_CONFIG = [
  {
    key: 'total',
    title: 'إجمالي النماذج',
    subtitle: 'نموذج منشور',
    subtitleKey: 'published' as keyof StatsType,
    bgColor: 'bg-amber-100/80 dark:bg-amber-950/30',
    skeleton: 'bg-amber-200 dark:bg-amber-900/40',
  },
  {
    key: 'published',
    title: 'النماذج المنشورة',
    subtitle: 'من الإجمالي',
    subtitleKey: 'total' as keyof StatsType,
    bgColor: 'bg-emerald-100/80 dark:bg-emerald-950/30',
    skeleton: 'bg-emerald-200 dark:bg-emerald-900/40',
  },
  {
    key: 'draft',
    title: 'النماذج المسودة',
    subtitle: 'من الإجمالي',
    subtitleKey: 'total' as keyof StatsType,
    bgColor: 'bg-sky-100/80 dark:bg-sky-950/30',
    skeleton: 'bg-sky-200 dark:bg-sky-900/40',
  },
  {
    key: 'totalSubmissions',
    title: 'إجمالي الإجابات',
    subtitle: 'إجابة',
    bgColor: 'bg-violet-100/80 dark:bg-violet-950/30',
    skeleton: 'bg-violet-200 dark:bg-violet-900/40',
  },
  {
    key: 'totalViews',
    title: 'إجمالي المشاهدات',
    subtitle: 'مشاهدة',
    bgColor: 'bg-rose-100/80 dark:bg-rose-950/30',
    skeleton: 'bg-rose-200 dark:bg-rose-900/40',
  },
  {
    key: 'responseRate',
    title: 'معدل الاستجابة',
    subtitle: 'نسبة التحويل',
    bgColor: 'bg-indigo-100/80 dark:bg-indigo-950/30',
    skeleton: 'bg-indigo-200 dark:bg-indigo-900/40',
    isPercentage: true,
  },
];

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K`;
  return num.toLocaleString('en-US');
};

const SkeletonCard = ({ bgColor, skeleton }: { bgColor: string; skeleton: string }) => (
  <div className={cn('rounded-2xl p-5', bgColor)}>
    <div className={cn('h-4 w-20 rounded animate-pulse mb-2', skeleton)} />
    <div className="flex items-center gap-3">
      <div className={cn('h-8 w-16 rounded animate-pulse', skeleton)} />
      <div className={cn('h-4 w-12 rounded animate-pulse', skeleton)} />
    </div>
  </div>
);

export function FormsStats({ stats, isLoading }: FormsStatsProps) {
  const responseRate = stats.totalViews > 0 
    ? Math.round((stats.totalSubmissions / stats.totalViews) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
        {STATS_CONFIG.map((stat, i) => (
          <SkeletonCard key={i} bgColor={stat.bgColor} skeleton={stat.skeleton} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3"
    >
      {STATS_CONFIG.map((stat) => {
        const value = stat.key === 'responseRate' 
          ? responseRate 
          : (stats[stat.key as keyof StatsType] || 0);
        
        const subtitleValue = 'subtitleKey' in stat && stat.subtitleKey
          ? (stats[stat.subtitleKey] || 0)
          : null;
        
        return (
          <motion.div
            key={stat.key}
            variants={ANIMATION_VARIANTS.item}
            whileHover={{ scale: 1.02, y: -2 }}
            className={cn(
              'rounded-2xl p-5 transition-all duration-200 text-right',
              stat.bgColor
            )}
          >
            <p className="text-sm text-muted-foreground mb-1">
              {stat.title}
            </p>

            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                {'isPercentage' in stat && stat.isPercentage ? `${value}%` : formatNumber(value)}
              </span>
              
              {subtitleValue !== null && (
                <span className="text-xs text-muted-foreground">
                  {subtitleValue}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
