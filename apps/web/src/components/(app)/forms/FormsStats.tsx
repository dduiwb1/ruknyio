'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp,
  TrendingDown,
  FileText,
  FileCheck,
  FilePen,
  MessageSquare,
  Eye,
  Percent
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormsStats as StatsType } from '@/lib/hooks/useForms';

interface FormsStatsProps {
  stats: StatsType;
  isLoading?: boolean;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
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

const statsConfig = [
  {
    key: 'total',
    title: 'إجمالي النماذج',
    subtitleKey: 'published',
    subtitleSuffix: 'نموذج منشور',
    bgColor: 'bg-amber-100',
    hoverColor: 'hover:bg-amber-200',
    textColor: 'text-amber-900',
    icon: FileText,
  },
  {
    key: 'published',
    title: 'النماذج المنشورة',
    subtitleKey: 'total',
    subtitleSuffix: 'من الإجمالي',
    bgColor: 'bg-emerald-100',
    hoverColor: 'hover:bg-emerald-200',
    textColor: 'text-emerald-900',
    icon: FileCheck,
  },
  {
    key: 'draft',
    title: 'النماذج المسودة',
    subtitleKey: 'total',
    subtitleSuffix: 'من الإجمالي',
    bgColor: 'bg-sky-100',
    hoverColor: 'hover:bg-sky-200',
    textColor: 'text-sky-900',
    icon: FilePen,
  },
  {
    key: 'totalSubmissions',
    title: 'إجمالي الإجابات',
    subtitleKey: 'published',
    subtitleSuffix: 'نموذج',
    bgColor: 'bg-violet-100',
    hoverColor: 'hover:bg-violet-200',
    textColor: 'text-violet-900',
    icon: MessageSquare,
  },
  {
    key: 'totalViews',
    title: 'إجمالي المشاهدات',
    subtitleKey: null,
    subtitleSuffix: 'مشاهدة',
    bgColor: 'bg-rose-100',
    hoverColor: 'hover:bg-rose-200',
    textColor: 'text-rose-900',
    icon: Eye,
  },
  {
    key: 'responseRate',
    title: 'معدل الاستجابة',
    subtitleKey: null,
    subtitleSuffix: 'نسبة التحويل',
    bgColor: 'bg-indigo-100',
    hoverColor: 'hover:bg-indigo-200',
    textColor: 'text-indigo-900',
    icon: Percent,
    isPercentage: true,
  },
];

// Format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K';
  }
  return num.toLocaleString('en-US');
};

export function FormsStats({ stats, isLoading }: FormsStatsProps) {
  // Calculate response rate (submissions / views * 100)
  const responseRate = stats.totalViews > 0 
    ? Math.round((stats.totalSubmissions / stats.totalViews) * 100) 
    : 0;

  // Calculate percentage change
  const calculateChange = (current: number, total: number): { change: string; isPositive: boolean } => {
    if (total === 0 || current === 0) return { change: '0%', isPositive: true };
    const percentage = Math.round((current / total) * 100);
    return { change: `${percentage}%`, isPositive: percentage > 0 };
  };

  if (isLoading) {
    const skeletonColors = ['bg-amber-100', 'bg-emerald-100', 'bg-sky-100', 'bg-violet-100', 'bg-rose-100', 'bg-indigo-100'];
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {skeletonColors.map((color, i) => (
          <div
            key={i}
            className={cn("rounded-2xl p-4 sm:p-5 animate-pulse", color)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="h-8 w-8 bg-white/50 rounded-xl" />
            </div>
            <div className="h-4 bg-white/50 rounded w-20 mb-2" />
            <div className="h-3 bg-white/30 rounded w-16 mb-3" />
            <div className="flex items-end justify-between">
              <div className="h-8 bg-white/50 rounded w-12" />
              <div className="h-5 bg-white/30 rounded-full w-14" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4"
    >
      {statsConfig.map((stat) => {
        // Handle response rate separately
        const value = stat.key === 'responseRate' 
          ? responseRate 
          : (stats[stat.key as keyof StatsType] || 0);
        const subtitleValue = stat.subtitleKey ? stats[stat.subtitleKey as keyof StatsType] || 0 : value;
        const change = calculateChange(
          stat.key === 'totalSubmissions' ? stats.published : value,
          stat.key === 'totalSubmissions' ? stats.total : stats.total
        );
        const Icon = stat.icon;
        
        return (
          <motion.div
            key={stat.key}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className={cn(
              "relative rounded-2xl p-4 sm:p-5",
              "transition-all duration-300",
              "text-right",
              stat.bgColor,
              stat.hoverColor
            )}
          >
            {/* Icon */}
            <div className="flex items-center justify-between mb-3">
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center",
                "bg-white/50"
              )}>
                <Icon className={cn("w-4 h-4", stat.textColor)} />
              </div>
            </div>

            {/* Title */}
            <p className={cn("text-sm font-medium mb-1", stat.textColor)}>
              {stat.title}
            </p>

            {/* Subtitle */}
            <p className="text-xs text-gray-500 mb-2">
              {stat.subtitleKey 
                ? `من ${subtitleValue} ${stat.subtitleSuffix}`
                : stat.subtitleSuffix
              }
            </p>

            {/* Value & Change Row */}
            <div className="flex items-end justify-between">
              {/* Value */}
              <motion.div
                className={cn("text-2xl sm:text-3xl font-bold", stat.textColor)}
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.02 }}
              >
                {(stat as any).isPercentage ? `${value}%` : formatNumber(value)}
              </motion.div>

              {/* Change Indicator */}
              {!(stat as any).isPercentage && (
                <div className={cn(
                  "flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
                  change.isPositive 
                    ? "bg-white/50 text-gray-700" 
                    : "bg-red-100 text-red-600"
                )}>
                  <span>~{change.change}</span>
                  {change.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
