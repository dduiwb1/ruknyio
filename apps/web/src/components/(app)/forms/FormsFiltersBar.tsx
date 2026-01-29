'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowUpDown, CheckCircle2, Clock, FileText, Ban, LayoutGrid, List, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  FormStatus, 
  FormsFilters,
  FormsSortOption
} from '@/lib/hooks/useForms';

interface FormsFiltersBarProps {
  filters: FormsFilters;
  onFiltersChange: (filters: FormsFilters) => void;
  sortBy: FormsSortOption;
  onSortChange: (sort: FormsSortOption) => void;
  resultsCount: number;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

const SORT_OPTIONS: { value: FormsSortOption; label: string }[] = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'oldest', label: 'الأقدم' },
  { value: 'name', label: 'أ-ي' },
  { value: 'submissions', label: 'الردود' },
];

const STATUS_FILTERS: { value: FormStatus | ''; label: string }[] = [
  { value: '', label: 'الكل' },
  { value: FormStatus.PUBLISHED, label: 'منشور' },
  { value: FormStatus.DRAFT, label: 'مسودة' },
  { value: FormStatus.CLOSED, label: 'مغلق' },
];

export function FormsFiltersBar({ 
  filters, 
  onFiltersChange,
  sortBy,
  onSortChange,
  resultsCount,
  viewMode = 'grid',
  onViewModeChange
}: FormsFiltersBarProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'الأحدث';

  return (
    <div className="space-y-3">
      {/* Main Filter Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search Button / Input */}
        <AnimatePresence mode="wait">
          {showSearch ? (
            <motion.div
              initial={{ width: 44, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 44, opacity: 0 }}
              className="relative"
            >
              <input
                type="text"
                autoFocus
                value={filters.search || ''}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                placeholder="بحث..."
                className="w-full h-11 pr-4 pl-10 bg-card rounded-full text-sm border border-border/50 focus:border-border focus:outline-none"
                onBlur={() => !filters.search && setShowSearch(false)}
              />
              <button
                onClick={() => { onFiltersChange({ ...filters, search: '' }); setShowSearch(false); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSearch(true)}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-card border border-border/50 hover:border-border transition-colors"
            >
              <Search className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 h-11 px-4 bg-card rounded-full border border-border/50 hover:border-border transition-colors"
          >
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">ترتيب</span>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", sortOpen && "rotate-180")} />
          </button>
          
          <AnimatePresence>
            {sortOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setSortOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full left-0 mt-2 bg-card rounded-2xl border border-border shadow-lg z-50 min-w-[140px] overflow-hidden py-1"
                >
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => { onSortChange(option.value); setSortOpen(false); }}
                      className={cn(
                        "w-full px-4 py-2.5 text-sm text-right hover:bg-muted transition-colors",
                        sortBy === option.value && "bg-muted font-medium"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Status Filter Pills */}
        {STATUS_FILTERS.map((status) => {
          const isActive = filters.status === status.value || (!filters.status && !status.value);
          return (
            <button
              key={status.value}
              onClick={() => onFiltersChange({ 
                ...filters, 
                status: status.value as FormStatus || undefined 
              })}
              className={cn(
                "h-11 px-5 rounded-full text-sm font-medium transition-all border",
                isActive
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-foreground border-border/50 hover:border-border"
              )}
            >
              {status.label}
            </button>
          );
        })}
      </div>

      {/* Second Row: View Toggle & Results */}
      <div className="flex items-center justify-between">
        {/* View Mode Toggle */}
        {onViewModeChange && (
          <div className="flex items-center bg-card rounded-full border border-border/50 p-1">
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                "p-2 rounded-full transition-colors",
                viewMode === 'list' ? "bg-muted" : "hover:bg-muted/50"
              )}
            >
              <List className={cn("w-4 h-4", viewMode === 'list' ? "text-foreground" : "text-muted-foreground")} />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                "p-2 rounded-full transition-colors",
                viewMode === 'grid' ? "bg-foreground text-background" : "hover:bg-muted/50"
              )}
            >
              <LayoutGrid className={cn("w-4 h-4", viewMode === 'grid' ? "text-background" : "text-muted-foreground")} />
            </button>
          </div>
        )}

        {/* Results Count */}
        <span className="text-sm text-muted-foreground">
          {resultsCount} نموذج
        </span>
      </div>
    </div>
  );
}
