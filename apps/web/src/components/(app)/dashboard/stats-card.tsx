"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ColorVariant = 'indigo' | 'purple' | 'cyan' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';

const colorConfig: Record<ColorVariant, { 
  bg: string;
  skeleton: string;
}> = {
  indigo: {
    bg: 'bg-indigo-100/80 dark:bg-indigo-950/30',
    skeleton: 'bg-indigo-200 dark:bg-indigo-900/40',
  },
  purple: {
    bg: 'bg-purple-100/80 dark:bg-purple-950/30',
    skeleton: 'bg-purple-200 dark:bg-purple-900/40',
  },
  cyan: {
    bg: 'bg-cyan-100/80 dark:bg-cyan-950/30',
    skeleton: 'bg-cyan-200 dark:bg-cyan-900/40',
  },
  blue: {
    bg: 'bg-sky-100/80 dark:bg-sky-950/30',
    skeleton: 'bg-sky-200 dark:bg-sky-900/40',
  },
  emerald: {
    bg: 'bg-emerald-100/80 dark:bg-emerald-950/30',
    skeleton: 'bg-emerald-200 dark:bg-emerald-900/40',
  },
  amber: {
    bg: 'bg-amber-100/80 dark:bg-amber-950/30',
    skeleton: 'bg-amber-200 dark:bg-amber-900/40',
  },
  rose: {
    bg: 'bg-rose-100/80 dark:bg-rose-950/30',
    skeleton: 'bg-rose-200 dark:bg-rose-900/40',
  },
  slate: {
    bg: 'bg-slate-100/80 dark:bg-slate-950/30',
    skeleton: 'bg-slate-200 dark:bg-slate-900/40',
  },
};

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon?: LucideIcon;
  index?: number;
  colorVariant?: ColorVariant;
}

export function StatsCard({
  title,
  value,
  change,
  trend,
  colorVariant = 'indigo',
}: StatsCardProps) {
  const colors = colorConfig[colorVariant];

  return (
    <div className={cn("rounded-2xl p-5 transition-all duration-200", colors.bg)}>
      {/* Title */}
      <p className="text-sm text-muted-foreground mb-1">{title}</p>

      {/* Value & Change Row */}
      <div className="flex items-center gap-3">
        {/* Value */}
        <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
          {value}
        </span>

        {/* Change with Trend */}
        <div className="flex items-center gap-0.5">
          <span className={cn(
            "text-xs font-medium",
            trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          )}>
            {change}
          </span>
          {trend === "up" ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          )}
        </div>
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  const colors = colorConfig.indigo;
  
  return (
    <div className={cn("rounded-2xl p-5", colors.bg)}>
      <div className={cn("h-4 w-20 rounded animate-pulse mb-2", colors.skeleton)} />
      <div className="flex items-center gap-3">
        <div className={cn("h-8 w-16 rounded animate-pulse", colors.skeleton)} />
        <div className={cn("h-4 w-12 rounded animate-pulse", colors.skeleton)} />
      </div>
    </div>
  );
}
