'use client';

import { motion } from 'framer-motion';
import { FileText, Eye, Send, BarChart3 } from 'lucide-react';
import type { FormsStats as StatsType } from '@/lib/hooks/useForms';

interface FormsStatsProps {
  stats: StatsType;
  isLoading?: boolean;
}

const statItems = [
  { key: 'total' as const, label: 'إجمالي النماذج', icon: FileText, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { key: 'published' as const, label: 'منشور', icon: Send, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { key: 'totalViews' as const, label: 'المشاهدات', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { key: 'totalSubmissions' as const, label: 'الإجابات', icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-500/10' },
];

export function FormsStats({ stats }: FormsStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statItems.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3"
          >
            <div className={`flex size-9 items-center justify-center rounded-lg ${item.bg}`}>
              <Icon className={`size-4 ${item.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stats[item.key]}</p>
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
